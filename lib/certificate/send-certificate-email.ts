import { CertificateReadyEmail } from "@/lib/email/templates/certificate-ready";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export async function sendCertificateEmail(params: {
  email: string;
  fullName: string;
  courseTitle: string;
  certificateUrl: string;
  pdfBuffer: Buffer;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Certificate] RESEND_API_KEY not set, skipping email");
    return false;
  }

  const customerName = params.fullName.trim() || "Katılımcı";
  const resend = getResendClient();

  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: params.email,
    subject: `Katılım Belgeniz Hazır – ${params.courseTitle}`,
    react: CertificateReadyEmail({
      customerName,
      courseTitle: params.courseTitle,
      certificateUrl: params.certificateUrl,
    }),
    attachments: [
      {
        filename: "katilim-belgesi.pdf",
        content: params.pdfBuffer,
      },
    ],
  });

  if (error) {
    console.error("[Certificate] Email failed:", error.message);
    return false;
  }

  return true;
}
