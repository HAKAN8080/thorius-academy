import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface CourseCertificateRecord {
  id: string;
  user_id: string;
  course_id: number;
  course_title: string;
  participant_name: string;
  issued_at: string;
}

export async function getCertificateByUserCourse(
  userId: string,
  courseId: number,
): Promise<CourseCertificateRecord | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("course_certificates")
    .select("id, user_id, course_id, course_title, participant_name, issued_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CourseCertificateRecord | null) ?? null;
}

export async function getCertificateById(
  certificateId: string,
): Promise<CourseCertificateRecord | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("course_certificates")
    .select("id, user_id, course_id, course_title, participant_name, issued_at")
    .eq("id", certificateId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return (data as CourseCertificateRecord | null) ?? null;
}

export async function createCertificateRecord(params: {
  id: string;
  userId: string;
  courseId: number;
  courseTitle: string;
  participantName: string;
  issuedAt: Date;
}): Promise<CourseCertificateRecord> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("course_certificates")
    .insert({
      id: params.id,
      user_id: params.userId,
      course_id: params.courseId,
      course_title: params.courseTitle,
      participant_name: params.participantName,
      issued_at: params.issuedAt.toISOString(),
    })
    .select("id, user_id, course_id, course_title, participant_name, issued_at")
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Certificate record could not be created");
  }

  return data as CourseCertificateRecord;
}
