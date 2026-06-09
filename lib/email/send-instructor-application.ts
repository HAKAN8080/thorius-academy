import { INSTRUCTOR_APPLICATION_ADMIN_EMAIL } from "@/lib/constants/admin";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export interface SendInstructorApplicationEmailParams {
  applicantName: string;
  applicantEmail: string;
  phone?: string | null;
  expertise: string;
  motivation: string;
  sampleCourseUrl?: string | null;
  applicationId: string;
}

export function isInstructorApplicationEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export async function sendInstructorApplicationEmail(
  params: SendInstructorApplicationEmailParams,
): Promise<boolean> {
  if (!isInstructorApplicationEmailConfigured()) {
    console.warn(
      "RESEND_API_KEY not set, skipping instructor application admin email",
    );
    return false;
  }

  const resend = getResendClient();
  const sampleLine = params.sampleCourseUrl
    ? `<p><strong>Örnek içerik:</strong> <a href="${params.sampleCourseUrl}">${params.sampleCourseUrl}</a></p>`
    : "";

  const { error } = await resend.emails.send({
    from: getResendFromAddress(),
    to: INSTRUCTOR_APPLICATION_ADMIN_EMAIL,
    replyTo: params.applicantEmail,
    subject: `Yeni eğitmen başvurusu: ${params.applicantName}`,
    html: `
      <h2>Yeni eğitmen başvurusu</h2>
      <p><strong>Ad Soyad:</strong> ${params.applicantName}</p>
      <p><strong>E-posta:</strong> ${params.applicantEmail}</p>
      <p><strong>Telefon:</strong> ${params.phone || "—"}</p>
      <p><strong>Uzmanlık alanı:</strong> ${params.expertise}</p>
      <p><strong>Motivasyon:</strong></p>
      <p>${params.motivation.replace(/\n/g, "<br />")}</p>
      ${sampleLine}
      <p><strong>Başvuru ID:</strong> ${params.applicationId}</p>
      <p>Başvuruyu Academy veritabanındaki <code>instructor_applications</code> tablosundan inceleyebilirsiniz.</p>
    `,
  });

  if (error) {
    console.error("Instructor application email failed:", error.message);
    return false;
  }

  return true;
}
