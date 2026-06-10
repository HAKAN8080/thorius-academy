import { getEmailRedirectUrl } from "@/lib/auth/app-url";
import { findAuthUserByEmail } from "@/lib/auth/find-user-by-email";
import {
  isSignupEmailConfigured,
  sendSignupWelcomeEmail,
} from "@/lib/email/send-signup-welcome";
import { getSignupCouponCode } from "@/lib/constants/promo";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
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
  recoveredPendingSignup?: boolean;
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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

async function generateSignupVerificationLink(
  email: string,
  redirectTo: string,
  password?: string,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "signup",
    email: normalizeEmail(email),
    password: password ?? "ThoriusTemp1!",
    options: {
      redirectTo: getEmailRedirectUrl(redirectTo),
    },
  });

  if (error) {
    console.error("Signup link generation failed:", error.message);
    return null;
  }

  return data?.properties?.action_link ?? null;
}

async function deliverSignupEmail(
  params: RegisterUserParams,
  options?: { recoveredPendingSignup?: boolean },
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();
  const verificationLink = params.password
    ? await generateSignupVerificationLink(
        email,
        params.redirectTo,
        params.password,
      )
    : null;

  if (!verificationLink) {
    const fallbackSent = await sendSupabaseVerificationFallback(
      email,
      params.redirectTo,
    );
    return {
      couponCode,
      verificationEmailSent: fallbackSent,
      recoveredPendingSignup: options?.recoveredPendingSignup,
    };
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
    return {
      couponCode,
      verificationEmailSent: fallbackSent,
      recoveredPendingSignup: options?.recoveredPendingSignup,
    };
  }

  return {
    couponCode,
    verificationEmailSent: true,
    recoveredPendingSignup: options?.recoveredPendingSignup,
  };
}

async function recoverPendingSignup(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const email = normalizeEmail(params.email);
  const existing = await findAuthUserByEmail(email);

  if (!existing) {
    throw new SignupError(mapSignupAuthError("already registered"));
  }

  if (existing.email_confirmed_at) {
    throw new SignupError(mapSignupAuthError("already registered"));
  }

  const admin = getSupabaseAdmin();
  const { error: updateError } = await admin.auth.admin.updateUserById(
    existing.id,
    {
      password: params.password,
      user_metadata: { full_name: params.fullName.trim() },
    },
  );

  if (updateError) {
    console.error("Pending signup password update failed:", updateError.message);
  }

  await ensureUserProfile(existing.id, {
    email,
    fullName: params.fullName.trim(),
  });

  return deliverSignupEmail(params, { recoveredPendingSignup: true });
}

async function signupViaPublicClient(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: normalizeEmail(params.email),
    password: params.password,
    options: {
      emailRedirectTo: getEmailRedirectUrl(params.redirectTo),
      data: { full_name: params.fullName.trim() },
    },
  });

  if (error) {
    if (isDuplicateSignupError(error.message)) {
      const serviceKey = getSupabaseServiceRoleKey();
      if (serviceKey && isSignupEmailConfigured()) {
        return recoverPendingSignup(params);
      }
    }
    throw new SignupError(mapSignupAuthError(error.message));
  }

  return { couponCode, verificationEmailSent: true };
}

async function registerUserViaAdmin(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();

  const admin = getSupabaseAdmin();
  const { data: createData, error: createError } =
    await admin.auth.admin.createUser({
      email,
      password: params.password,
      email_confirm: false,
      user_metadata: { full_name: fullName },
    });

  if (createError) {
    if (isDuplicateSignupError(createError.message)) {
      return recoverPendingSignup(params);
    }

    console.error("Admin createUser failed:", createError.message);
    return signupViaPublicClient(params);
  }

  const userId = createData.user?.id;
  if (userId) {
    await ensureUserProfile(userId, { email, fullName });
  }

  return deliverSignupEmail(params);
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

    console.error("Admin signup path failed:", error);
    throw new SignupError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
  }
}

export async function resendSignupWelcomeEmail(
  email: string,
  redirectTo: string,
): Promise<{ couponCode: string; sent: boolean }> {
  const couponCode = getSignupCouponCode();
  const normalizedEmail = normalizeEmail(email);

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

  const existing = await findAuthUserByEmail(normalizedEmail);
  const fullName =
    typeof existing?.user_metadata?.full_name === "string"
      ? existing.user_metadata.full_name
      : "";

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
    const fallbackSent = await sendSupabaseVerificationFallback(
      normalizedEmail,
      redirectTo,
    );
    if (!fallbackSent) {
      throw new Error("RESEND_FAILED");
    }
    return { couponCode, sent: true };
  }

  const sent = await sendSignupWelcomeEmail({
    email: normalizedEmail,
    fullName,
    verificationLink,
  });

  if (!sent) {
    const fallbackSent = await sendSupabaseVerificationFallback(
      normalizedEmail,
      redirectTo,
    );
    if (!fallbackSent) {
      throw new Error("RESEND_FAILED");
    }
    return { couponCode, sent: true };
  }

  return { couponCode, sent: true };
}
