import { WelcomeCouponEmail } from "@/lib/email/templates/welcome-coupon";
import { getSignupCouponCode } from "@/lib/constants/promo";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export async function sendWelcomeCouponEmail(
  email: string,
  fullName: string,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping welcome coupon email");
    return;
  }

  const couponCode = getSignupCouponCode();
  const resend = getResendClient();

  await resend.emails.send({
    from: getResendFromAddress(),
    to: email,
    subject: `Hoş geldiniz! %20 indirim kuponunuz: ${couponCode}`,
    react: WelcomeCouponEmail({ customerName: fullName, couponCode }),
  });
}
