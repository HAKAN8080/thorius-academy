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
  if (/signups? not allowed|signup disabled|email provider|smtp|mailer/.test(lower)) {
    return "Kayıt e-postası şu an gönderilemiyor. Lütfen birkaç dakika sonra tekrar deneyin veya destek ile iletişime geçin.";
  }

  return "Kayıt oluşturulamadı. Lütfen tekrar deneyin.";
}

function isDuplicateSignupError(message: string): boolean {
  return /already|registered|exists|duplicate/i.test(message);
}

function isRecoverableSignupError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    isDuplicateSignupError(message) ||
    /confirmation email|error sending|email.*send|mailer|smtp|user already/i.test(
      lower,
    )
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
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
    console.error("[Signup] ensureUserProfile failed:", error);
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
      console.error("Supabase verification fallback failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Supabase verification fallback threw:", error);
    return false;
  }
}

type VerificationLinkMode = "invite" | "signup";

async function generateVerificationLink(
  email: string,
  redirectTo: string,
  mode: VerificationLinkMode,
  password?: string,
): Promise<string | null> {
  try {
    const admin = getSupabaseAdmin();
    const normalizedEmail = normalizeEmail(email);
    const redirect = getEmailRedirectUrl(redirectTo);

    if (mode === "invite") {
      const { data, error } = await admin.auth.admin.generateLink({
        type: "invite",
        email: normalizedEmail,
        options: { redirectTo: redirect },
      });

      if (error) {
        console.error("Invite link generation failed:", error.message);
        return null;
      }

      return data?.properties?.action_link ?? null;
    }

    const { data, error } = await admin.auth.admin.generateLink({
      type: "signup",
      email: normalizedEmail,
      password: password ?? "ThoriusTemp1!",
      options: { redirectTo: redirect },
    });

    if (error) {
      console.error("Signup link generation failed:", error.message);
      return null;
    }

    return data?.properties?.action_link ?? null;
  } catch (error) {
    console.error("Verification link generation threw:", error);
    return null;
  }
}

async function deliverSignupEmail(
  params: RegisterUserParams,
  options?: {
    recoveredPendingSignup?: boolean;
    linkMode?: VerificationLinkMode;
  },
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const email = normalizeEmail(params.email);
  const fullName = params.fullName.trim();
  const linkMode = options?.linkMode ?? "invite";

  let verificationLink = await generateVerificationLink(
    email,
    params.redirectTo,
    linkMode,
    params.password,
  );

  if (!verificationLink && linkMode === "signup") {
    verificationLink = await generateVerificationLink(
      email,
      params.redirectTo,
      "invite",
    );
  }

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

  if (existing?.email_confirmed_at) {
    throw new SignupError(mapSignupAuthError("already registered"));
  }

  if (existing) {
    try {
      const admin = getSupabaseAdmin();
      const { error: updateError } = await admin.auth.admin.updateUserById(
        existing.id,
        {
          password: params.password,
          user_metadata: { full_name: params.fullName.trim() },
        },
      );

      if (updateError) {
        console.error(
          "Pending signup password update failed:",
          updateError.message,
        );
      }

      await safeEnsureUserProfile(existing.id, {
        email,
        fullName: params.fullName.trim(),
      });
    } catch (error) {
      console.error("[Signup] recoverPendingSignup user update failed:", error);
    }
  }

  return deliverSignupEmail(params, {
    recoveredPendingSignup: true,
    linkMode: "invite",
  });
}

async function signupViaPublicClient(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(params.email),
      password: params.password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(params.redirectTo),
        data: { full_name: params.fullName.trim() },
      },
    });

    if (error) {
      if (
        isRecoverableSignupError(error.message) &&
        Boolean(getSupabaseServiceRoleKey()) &&
        isSignupEmailConfigured()
      ) {
        return recoverPendingSignup(params);
      }
      throw new SignupError(mapSignupAuthError(error.message));
    }

    if (data.user?.id) {
      await safeEnsureUserProfile(data.user.id, {
        email: params.email,
        fullName: params.fullName.trim(),
      });
    }

    return { couponCode, verificationEmailSent: true };
  } catch (error) {
    if (error instanceof SignupError) {
      throw error;
    }
    console.error("[Signup] public client path failed:", error);
    throw new SignupError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
  }
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

    if (isRecoverableSignupError(createError.message)) {
      return recoverPendingSignup(params);
    }

    return signupViaPublicClient(params);
  }

  const userId = createData.user?.id;
  if (userId) {
    await safeEnsureUserProfile(userId, { email, fullName });
  }

  return deliverSignupEmail(params, { linkMode: "invite" });
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

    try {
      return await recoverPendingSignup(params);
    } catch (recoverError) {
      if (recoverError instanceof SignupError) {
        throw recoverError;
      }
      console.error("Signup recovery failed:", recoverError);
      throw new SignupError("Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
    }
  }
}

export async function resendSignupWelcomeEmail(
  email: string,
  redirectTo: string,
): Promise<{ couponCode: string; sent: boolean }> {
  const couponCode = getSignupCouponCode();
  const normalizedEmail = normalizeEmail(email);

  if (!isSignupEmailConfigured()) {
    const fallbackSent = await sendSupabaseVerificationFallback(
      normalizedEmail,
      redirectTo,
    );
    if (!fallbackSent) {
      throw new Error("RESEND_FAILED");
    }
    return { couponCode, sent: true };
  }

  const serviceKey = getSupabaseServiceRoleKey();
  if (!serviceKey) {
    const fallbackSent = await sendSupabaseVerificationFallback(
      normalizedEmail,
      redirectTo,
    );
    if (!fallbackSent) {
      throw new Error("RESEND_FAILED");
    }
    return { couponCode, sent: true };
  }

  const existing = await findAuthUserByEmail(normalizedEmail);
  const fullName =
    typeof existing?.user_metadata?.full_name === "string"
      ? existing.user_metadata.full_name
      : "";

  const verificationLink = await generateVerificationLink(
    normalizedEmail,
    redirectTo,
    "invite",
  );

  if (!verificationLink) {
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
