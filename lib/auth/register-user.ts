import { getEmailRedirectUrl } from "@/lib/auth/app-url";
import {
  isSignupEmailConfigured,
  sendSignupWelcomeEmail,
} from "@/lib/email/send-signup-welcome";
import { getSignupCouponCode } from "@/lib/constants/promo";
import { ensureUserProfile } from "@/lib/profile/ensure-profile";
import { getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

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

export type RegisterUserOutcome =
  | { ok: true; result: RegisterUserResult }
  | { ok: false; error: string };

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
  if (/signups? not allowed|signup disabled|email provider disabled/i.test(lower)) {
    return "Yeni üyelikler şu an kapalı. Lütfen daha sonra tekrar deneyin.";
  }

  return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
}

function isFatalSignupError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    (/password/.test(lower) &&
      /short|least|weak|characters|length/.test(lower)) ||
    /invalid email|valid email|email address/.test(lower) ||
    /rate limit|too many requests/.test(lower) ||
    /signups? not allowed|signup disabled|email provider disabled/.test(lower)
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
  if (!getSupabaseServiceRoleKey()) {
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
): Promise<boolean> {
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();

  try {
    if (!isSignupEmailConfigured()) {
      return sendSupabaseVerificationFallback(email, params.redirectTo);
    }

    const verificationLink = await generateMagicLink(email, params.redirectTo);

    if (!verificationLink) {
      return sendSupabaseVerificationFallback(email, params.redirectTo);
    }

    const emailSent = await sendSignupWelcomeEmail({
      email,
      fullName,
      verificationLink,
    });

    if (!emailSent) {
      return sendSupabaseVerificationFallback(email, params.redirectTo);
    }

    return true;
  } catch (error) {
    logSignupFailure("deliverSignupEmail", error);
    return sendSupabaseVerificationFallback(email, params.redirectTo);
  }
}

async function probeSignInState(
  supabase: SupabaseClient,
  email: string,
  password: string,
): Promise<"confirmed" | "unconfirmed" | "unknown"> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });

    if (!error && data.user) {
      await supabase.auth.signOut();
      return "confirmed";
    }

    const message = error?.message.toLowerCase() ?? "";
    if (message.includes("email not confirmed")) {
      return "unconfirmed";
    }
  } catch (error) {
    logSignupFailure("probeSignInState", error);
  }

  return "unknown";
}

async function buildSuccessResult(
  params: RegisterUserParams,
  options?: { recoveredPendingSignup?: boolean },
): Promise<RegisterUserResult> {
  const verificationEmailSent = await deliverSignupEmail(params);

  return {
    couponCode: getSignupCouponCode(),
    verificationEmailSent,
    recoveredPendingSignup: options?.recoveredPendingSignup,
  };
}

export async function registerUser(
  params: RegisterUserParams,
): Promise<RegisterUserOutcome> {
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    logSignupFailure("createClient", error);
    return {
      ok: false,
      error:
        "Kayıt servisi yapılandırması eksik. Lütfen daha sonra tekrar deneyin.",
    };
  }

  try {
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

    if (error) {
      logSignupFailure("auth.signUp", error.message);

      const signInState = await probeSignInState(
        supabase,
        email,
        params.password,
      );

      if (signInState === "confirmed") {
        return {
          ok: false,
          error: mapSignupAuthError("already registered"),
        };
      }

      if (isFatalSignupError(error.message)) {
        return { ok: false, error: mapSignupAuthError(error.message) };
      }

      return {
        ok: true,
        result: await buildSuccessResult(params, {
          recoveredPendingSignup: true,
        }),
      };
    }

    return {
      ok: true,
      result: await buildSuccessResult(params, {
        recoveredPendingSignup: !userId,
      }),
    };
  } catch (error) {
    logSignupFailure("registerUser.unhandled", error);
    return {
      ok: false,
      error: "Kayıt oluşturulamadı. Lütfen tekrar deneyin.",
    };
  }
}

export async function resendSignupWelcomeEmail(
  email: string,
  redirectTo: string,
): Promise<{ couponCode: string; sent: boolean }> {
  const verificationEmailSent = await deliverSignupEmail({
    email,
    password: "unused-resend",
    fullName: "",
    redirectTo,
  });

  if (!verificationEmailSent) {
    throw new Error("RESEND_FAILED");
  }

  return { couponCode: getSignupCouponCode(), sent: true };
}
