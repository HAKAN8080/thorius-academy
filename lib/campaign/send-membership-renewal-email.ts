import type { PromoCourse } from "@/lib/campaign/pick-promo-courses";
import { MembershipRenewalEmail } from "@/lib/email/templates/membership-renewal";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export async function sendMembershipRenewalEmail(params: {
  email: string;
  fullName: string;
  passwordRenewalLink: string;
  promoCourses: PromoCourse[];
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Campaign] RESEND_API_KEY not set");
    return false;
  }

  const customerName = params.fullName.trim() || "Üyemiz";
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: params.email,
    subject: "Thorius Academy — Üyelik şifrenizin süresi doldu",
    react: MembershipRenewalEmail({
      customerName,
      passwordRenewalLink: params.passwordRenewalLink,
      promoCourses: params.promoCourses,
    }),
  });

  if (error) {
    console.error("[Campaign] Email failed:", params.email, error.message);
    return false;
  }

  return true;
}
