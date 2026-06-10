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
  if (/database error|saving new user|unexpected failure/i.test(lower)) {
    return "Hesap kaydı tamamlanamadı. Lütfen bir süre sonra tekrar deneyin veya destek ile iletişime geçin.";
  }
  if (/signups? not allowed|signup disabled|email provider disabled/i.test(lower)) {
    return "Yeni üyelikler şu an kapalı. Lütfen daha sonra tekrar deneyin.";
  }

  return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
}

function isRecoverableSignupError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    /already|registered|exists|duplicate/i.test(message) ||
    /confirmation email|error sending|email.*send|mailer|smtp|user already/i.test(
      lower,
    )
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function logSignupFailure(stage: string, error: unknown): void {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : JSON.stringify(error);
  console.error(`[Signup] ${stage}:`, message);
}

async function safeEnsureUserProfile(
  userId: string,
  options?: {
    email?: string | null;
    fullName?: string | null;
  },
): Promise<void> {
  try {
    await ensureUserProfile(userId, options);
  } catch (error) {
    logSignupFailure("ensureUserProfile", error);
  }
}

async function sendSupabaseVerificationFallback(
  email: string,
  redirectTo: string,
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: getEmailRedirectUrl(redirectTo),
      },
    });

    if (error) {
      logSignupFailure("supabase.resend", error.message);
      return false;
    }

    return true;
  } catch (error) {
    logSignupFailure("supabase.resend.throw", error);
    return false;
  }
}

async function generateMagicLink(
  email: string,
  redirectTo: string,
): Promise<string | null> {
  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    return null;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizeEmail(email),
      options: {
        redirectTo: getEmailRedirectUrl(redirectTo),
      },
    });

    if (error) {
      logSignupFailure("generateLink.magiclink", error.message);
      return null;
    }

    return data?.properties?.action_link ?? null;
  } catch (error) {
    logSignupFailure("generateLink.magiclink.throw", error);
    return null;
  }
}

async function deliverSignupEmail(
  params: RegisterUserParams,
  options?: { recoveredPendingSignup?: boolean },
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();

  if (!isSignupEmailConfigured()) {
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

  const verificationLink = await generateMagicLink(email, params.redirectTo);

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

async function finishSignup(
  params: RegisterUserParams,
  options?: { recoveredPendingSignup?: boolean },
): Promise<RegisterUserResult> {
  const emailResult = await deliverSignupEmail(params, options);
  return {
    ...emailResult,
    couponCode: getSignupCouponCode(),
  };
}

async function resolveExistingSignup(
  params: RegisterUserParams,
): Promise<RegisterUserResult | null> {
  if (!getSupabaseServiceRoleKey()) {
    return null;
  }

  const existing = await findAuthUserByEmail(params.email);
  if (!existing) {
    return null;
  }

  if (existing.email_confirmed_at) {
    throw new SignupError(mapSignupAuthError("already registered"));
  }

  await safeEnsureUserProfile(existing.id, {
    email: params.email,
    fullName: params.fullName.trim(),
  });

  return finishSignup(params, { recoveredPendingSignup: true });
}

export async function registerUser(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    logSignupFailure("createClient", error);
    throw new SignupError(
      "Kayıt servisi yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password: params.password,
    options: {
      emailRedirectTo: getEmailRedirectUrl(params.redirectTo),
      data: { full_name: fullName },
    },
  });

  const userId = data.user?.id ?? null;

  if (userId) {
    await safeEnsureUserProfile(userId, { email, fullName });
  }

  if (!error && userId) {
    return finishSignup(params);
  }

  if (error) {
    logSignupFailure("auth.signUp", error.message);

    if (userId || isRecoverableSignupError(error.message)) {
      return finishSignup(params, { recoveredPendingSignup: true });
    }

    const existingResult = await resolveExistingSignup(params);
    if (existingResult) {
      return existingResult;
    }

    throw new SignupError(mapSignupAuthError(error.message));
  }

  const existingResult = await resolveExistingSignup(params);
  if (existingResult) {
    return existingResult;
  }

  throw new SignupError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
}

export async function resendSignupWelcomeEmail(
  email: string,
  redirectTo: string,
): Promise<{ couponCode: string; sent: boolean }> {
  const result = await finishSignup(
    {
      email,
      password: "unused-resend",
      fullName: "",
      redirectTo,
    },
    { recoveredPendingSignup: true },
  );

  if (!result.verificationEmailSent) {
    throw new Error("RESEND_FAILED");
  }

  return { couponCode: result.couponCode, sent: true };
}
