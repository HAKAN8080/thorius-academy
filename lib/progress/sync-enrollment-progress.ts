import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { deliverCertificateOnCourseComplete } from "@/lib/certificate/certificate-service";

export async function syncEnrollmentProgress(
  supabase: SupabaseClient,
  userId: string,
  courseId: number,
  options?: { courseSlug?: string; wpLessonId?: number },
): Promise<void> {
  const { count: totalLessons } = await supabase
    .from("lessons")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseId);

  const { count: completedLessons } = await supabase
    .from("lesson_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .eq("completed", true);

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();

  const wasAlreadyComplete = enrollment?.status === "completed";

  const total = totalLessons ?? 0;
  const completed = completedLessons ?? 0;
  const progress =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const isCourseComplete = total > 0 && completed >= total;

  const updatePayload: {
    progress: number;
    status: "active" | "completed";
    completed_at: string | null;
    last_lesson_id?: number;
  } = {
    progress,
    status: isCourseComplete ? "completed" : "active",
    completed_at: isCourseComplete ? new Date().toISOString() : null,
  };

  if (options?.wpLessonId) {
    updatePayload.last_lesson_id = options.wpLessonId;
  }

  await supabase
    .from("enrollments")
    .update(updatePayload)
    .eq("user_id", userId)
    .eq("course_id", courseId);

  revalidatePath("/panel/kurslarim");
  if (options?.courseSlug) {
    revalidatePath(`/panel/kurslarim/${options.courseSlug}`);
  }

  if (isCourseComplete && !wasAlreadyComplete) {
    void deliverCertificateOnCourseComplete(supabase, userId, courseId).catch(
      (error) => {
        console.error("[Certificate] Auto-delivery failed:", error);
      },
    );
  }
}
