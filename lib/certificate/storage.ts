import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const CERTIFICATE_BUCKET = "certificates";

export function getCertificateStoragePath(
  userId: string,
  courseId: number,
): string {
  return `${userId}/${courseId}.pdf`;
}

export function getCertificatePublicUrl(
  userId: string,
  courseId: number,
): string {
  const admin = getSupabaseAdmin();
  const path = getCertificateStoragePath(userId, courseId);
  const { data } = admin.storage.from(CERTIFICATE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function certificateExists(
  userId: string,
  courseId: number,
): Promise<boolean> {
  const admin = getSupabaseAdmin();
  const path = getCertificateStoragePath(userId, courseId);
  const { data, error } = await admin.storage.from(CERTIFICATE_BUCKET).download(path);

  if (error || !data) {
    return false;
  }

  return data.size > 0;
}

export async function uploadCertificatePdf(
  userId: string,
  courseId: number,
  pdfBuffer: Buffer,
): Promise<string> {
  const admin = getSupabaseAdmin();
  const path = getCertificateStoragePath(userId, courseId);

  const { error } = await admin.storage.from(CERTIFICATE_BUCKET).upload(path, pdfBuffer, {
    contentType: "application/pdf",
    upsert: true,
  });

  if (error) {
    throw new Error(`Certificate upload failed: ${error.message}`);
  }

  return getCertificatePublicUrl(userId, courseId);
}
