import { getEmailRedirectUrl } from "@/lib/auth/app-url";
import {
  isSignupEmailConfigured,
  sendSignupWelcomeEmail,
} from "@/lib/email/send-signup-welcome";
import { getSignupCouponCode } from "@/lib/constants/promo";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface RegisterUserParams {
  email: string;
  password: string;
  fullName: string;
  redirectTo: string;
}

export interface RegisterUserResult {
  couponCode: string;
  verificationEmailSent: boolean;
}

export class SignupError extends Error {
  userMessage: string;

  constructor(userMessage: string) {
    super(userMessage);
    this.name = "SignupError";
    this.userMessage = userMessage;
  }
}

export function mapSignupAuthError(message: string): string {
  const lower = message.toLowerCase();

  if (/already|registered|exists|duplicate/.test(lower)) {
    return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı veya parola sıfırlamayı deneyin.";
  }
  if (/password/.test(lower) && /short|least|weak|characters|length/.test(lower)) {
    return "Parola en az 8 karakter olmalıdır.";
  }
  if (/invalid email|valid email|email address/.test(lower)) {
    return "Geçerli bir e-posta adresi girin.";
  }
  if (/rate limit|too many requests/.test(lower)) {
    return "Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.";
  }

  return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
}

function isDuplicateSignupError(message: string): boolean {
  return /already|registered|exists|duplicate/i.test(message);
}

async function sendSupabaseVerificationFallback(
  email: string,
  redirectTo: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: getEmailRedirectUrl(redirectTo),
    },
  });

  if (error) {
    console.error("Supabase verification fallback failed:", error.message);
    return false;
  }

  return true;
}

async function signupViaPublicClient(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      emailRedirectTo: getEmailRedirectUrl(params.redirectTo),
      data: { full_name: params.fullName.trim() },
    },
  });

  if (error) {
    throw new SignupError(mapSignupAuthError(error.message));
  }

  return { couponCode, verificationEmailSent: true };
}

async function registerUserViaAdmin(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const email = params.email.trim();
  const fullName = params.fullName.trim();

  const admin = getSupabaseAdmin();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password: params.password,
    email_confirm: false,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    if (isDuplicateSignupError(createError.message)) {
      throw new SignupError(mapSignupAuthError(createError.message));
    }

    console.error("Admin createUser failed:", createError.message);
    return signupViaPublicClient(params);
  }

  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password: params.password,
      options: {
        redirectTo: getEmailRedirectUrl(params.redirectTo),
      },
    });

  const verificationLink = linkData?.properties?.action_link;

  if (linkError || !verificationLink) {
    console.error(
      "Signup link generation failed:",
      linkError?.message ?? "missing action_link",
    );
    const fallbackSent = await sendSupabaseVerificationFallback(
      email,
      params.redirectTo,
    );
    return { couponCode, verificationEmailSent: fallbackSent };
  }

  const emailSent = await sendSignupWelcomeEmail({
    email,
    fullName,
    verificationLink,
  });

  if (!emailSent) {
    const fallbackSent = await sendSupabaseVerificationFallback(
      email,
      params.redirectTo,
    );
    return { couponCode, verificationEmailSent: fallbackSent };
  }

  return { couponCode, verificationEmailSent: true };
}

export async function registerUser(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const canUseAdmin =
    isSignupEmailConfigured() && Boolean(getSupabaseServiceRoleKey());

  if (!canUseAdmin) {
    return signupViaPublicClient(params);
  }

  try {
    return await registerUserViaAdmin(params);
  } catch (error) {
    if (error instanceof SignupError) {
      throw error;
    }

    console.error(
      "Admin signup path failed, falling back to public signup:",
      error,
    );
    return signupViaPublicClient(params);
  }
}

export async function resendSignupWelcomeEmail(
  email: string,
  redirectTo: string,
): Promise<{ couponCode: string; sent: boolean }> {
  const couponCode = getSignupCouponCode();
  const normalizedEmail = email.trim();

  if (!isSignupEmailConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: getEmailRedirectUrl(redirectTo),
      },
    });

    if (error) {
      throw new Error("RESEND_FAILED");
    }

    return { couponCode, sent: true };
  }

  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: {
        emailRedirectTo: getEmailRedirectUrl(redirectTo),
      },
    });

    if (error) {
      throw new Error("RESEND_FAILED");
    }

    return { couponCode, sent: true };
  }

  const admin = getSupabaseAdmin();
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
      options: {
        redirectTo: getEmailRedirectUrl(redirectTo),
      },
    });

  const verificationLink = linkData?.properties?.action_link;

  if (linkError || !verificationLink) {
    console.error(
      "Signup resend link generation failed:",
      linkError?.message ?? "missing action_link",
    );
    throw new Error("RESEND_FAILED");
  }

  const sent = await sendSignupWelcomeEmail({
    email: normalizedEmail,
    fullName: "",
    verificationLink,
  });

  if (!sent) {
    throw new Error("RESEND_FAILED");
  }

  return { couponCode, sent: true };
}
