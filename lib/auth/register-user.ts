import { getEmailRedirectUrl } from "@/lib/auth/app-url";
import {
  isSignupEmailConfigured,
  sendSignupWelcomeEmail,
} from "@/lib/email/send-signup-welcome";
import { getSignupCouponCode } from "@/lib/constants/promo";
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

export async function registerUser(
  params: RegisterUserParams,
): Promise<RegisterUserResult> {
  const couponCode = getSignupCouponCode();
  const email = params.email.trim();
  const fullName = params.fullName.trim();

  if (!isSignupEmailConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password: params.password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(params.redirectTo),
        data: { full_name: fullName },
      },
    });

    if (error) {
      throw new Error("SIGNUP_FAILED");
    }

    return { couponCode, verificationEmailSent: true };
  }

  const admin = getSupabaseAdmin();
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password: params.password,
    email_confirm: false,
    user_metadata: { full_name: fullName },
  });

  if (createError) {
    throw new Error("SIGNUP_FAILED");
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
