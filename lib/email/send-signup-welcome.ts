import { SignupWelcomeEmail } from "@/lib/email/templates/signup-welcome";
import {
  getSignupCouponCode,
  SIGNUP_DISCOUNT_PERCENT,
} from "@/lib/constants/promo";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export interface SendSignupWelcomeEmailParams {
  email: string;
  fullName: string;
  verificationLink: string;
}

export function isSignupEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendSignupWelcomeEmail(
  params: SendSignupWelcomeEmailParams,
): Promise<boolean> {
  if (!isSignupEmailConfigured()) {
    console.warn("RESEND_API_KEY not set, skipping signup welcome email");
    return false;
  }

  try {
    const couponCode = getSignupCouponCode();
    const resend = getResendClient();
    const customerName = params.fullName.trim() || "Üyemiz";

    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to: params.email,
      subject: `Thorius Academy — E-postanızı doğrulayın & %${SIGNUP_DISCOUNT_PERCENT} kuponunuz: ${couponCode}`,
      react: SignupWelcomeEmail({
        customerName,
        couponCode,
        verificationLink: params.verificationLink,
      }),
    });

    if (error) {
      console.error("Signup welcome email failed:", error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      "Signup welcome email threw:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
