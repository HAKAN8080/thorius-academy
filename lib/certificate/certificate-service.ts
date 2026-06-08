import type { SupabaseClient } from "@supabase/supabase-js";
import { getCourseProgressForUser } from "@/lib/progress/lesson-progress-service";
import { generateCertificatePdf } from "@/lib/certificate/generate-pdf";
import {
  certificateExists,
  getCertificatePublicUrl,
  uploadCertificatePdf,
} from "@/lib/certificate/storage";
import { sendCertificateEmail } from "@/lib/certificate/send-certificate-email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { GenerateCertificateResponse } from "@/lib/certificate/types";

interface GenerateCertificateOptions {
  sendEmail?: boolean;
}

async function resolveFullName(
  supabase: SupabaseClient,
  userId: string,
  fallbackEmail?: string | null,
): Promise<string> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();

  if (profile?.full_name?.trim()) {
    return profile.full_name.trim();
  }

  const admin = getSupabaseAdmin();
  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const metadataName = authData.user?.user_metadata?.full_name;

  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (fallbackEmail) {
    const localPart = fallbackEmail.split("@")[0]?.trim();
    if (localPart) {
      return localPart;
    }
  }

  return "Katılımcı";
}

async function resolveCompletionDate(
  supabase: SupabaseClient,
  userId: string,
  courseId: number,
  enrollmentCompletedAt: string | null,
): Promise<Date> {
  if (enrollmentCompletedAt) {
    return new Date(enrollmentCompletedAt);
  }

  const { data: progressRows } = await supabase
    .from("lesson_progress")
    .select("completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", true)
    .order("completed_at", { ascending: false })
    .limit(1);

  const latest = progressRows?.[0]?.completed_at;
  if (latest) {
    return new Date(latest);
  }

  return new Date();
}

export async function isCourseFullyCompleted(
  supabase: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<boolean> {
  const progress = await getCourseProgressForUser(userId, courseId);
  return (
    progress.total_lessons > 0 &&
    progress.completed_count >= progress.total_lessons &&
    progress.completion_percent === 100
  );
}

export async function generateCourseCertificate(
  supabase: SupabaseClient,
  userId: string,
  userEmail: string | undefined,
  courseId: number,
  options: GenerateCertificateOptions = {},
): Promise<GenerateCertificateResponse> {
  const sendEmail = options.sendEmail ?? true;

  const isComplete = await isCourseFullyCompleted(supabase, userId, courseId);
  if (!isComplete) {
    return {
      success: false,
      error: "Kurs tamamlanmadan katılım belgesi oluşturulamaz.",
      status: 400,
    };
  }

  const alreadyExists = await certificateExists(userId, courseId);
  if (alreadyExists) {
    return {
      success: true,
      certificate_url: getCertificatePublicUrl(userId, courseId),
      emailed: false,
    };
  }

  const { data: enrollment, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("course_title, completed_at")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  if (enrollmentError || !enrollment?.course_title) {
    return {
      success: false,
      error: "Kurs kaydı bulunamadı.",
      status: 404,
    };
  }

  const fullName = await resolveFullName(supabase, userId, userEmail);
  const completionDate = await resolveCompletionDate(
    supabase,
    userId,
    courseId,
    enrollment.completed_at,
  );

  const pdfBuffer = await generateCertificatePdf({
    fullName,
    courseTitle: enrollment.course_title,
    completionDate,
  });

  const certificateUrl = await uploadCertificatePdf(userId, courseId, pdfBuffer);

  let emailed = false;
  if (sendEmail && userEmail) {
    emailed = await sendCertificateEmail({
      email: userEmail,
      fullName,
      courseTitle: enrollment.course_title,
      certificateUrl,
      pdfBuffer,
    });
  }

  return {
    success: true,
    certificate_url: certificateUrl,
    emailed,
  };
}

export async function deliverCertificateOnCourseComplete(
  supabase: SupabaseClient,
  userId: string,
  courseId: number,
): Promise<void> {
  const admin = getSupabaseAdmin();
  const { data: authData } = await admin.auth.admin.getUserById(userId);
  const email = authData.user?.email;

  const result = await generateCourseCertificate(
    supabase,
    userId,
    email,
    courseId,
    { sendEmail: true },
  );

  if (!result.success) {
    console.warn(
      `[Certificate] Auto-delivery skipped for user ${userId}, course ${courseId}: ${result.error}`,
    );
  }
}
