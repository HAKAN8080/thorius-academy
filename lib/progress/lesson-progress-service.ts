import { createClient } from "@/lib/supabase/server";
import { syncEnrollmentProgress } from "@/lib/progress/sync-enrollment-progress";
import type {
  CourseProgressResponse,
  UpdateProgressBody,
} from "@/lib/progress/types";

export async function upsertLessonProgress(
  userId: string,
  body: UpdateProgressBody,
  options?: { courseSlug?: string; wpLessonId?: number },
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const completed = body.completed ?? false;
  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("lesson_progress")
    .select("completed, completed_at, watched_seconds")
    .eq("user_id", userId)
    .eq("lesson_id", body.lesson_id)
    .maybeSingle();

  const isCompleted = completed || Boolean(existing?.completed);
  const watchedSeconds = Math.max(
    body.watched_seconds,
    existing?.watched_seconds ?? 0,
  );

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: body.lesson_id,
      course_id: body.course_id,
      watched_seconds: watchedSeconds,
      completed: isCompleted,
      completed_at: isCompleted
        ? completed
          ? now
          : (existing?.completed_at ?? now)
        : null,
      last_watched_at: now,
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) {
    return { success: false, error: error.message };
  }

  await syncEnrollmentProgress(supabase, userId, body.course_id, {
    courseSlug: options?.courseSlug,
    wpLessonId: options?.wpLessonId,
  });

  return { success: true };
}

export async function getCourseProgressForUser(
  userId: string,
  courseId: number,
): Promise<CourseProgressResponse> {
  const supabase = await createClient();

  const [{ data: progressRows }, { count: totalLessons }] = await Promise.all([
    supabase
      .from("lesson_progress")
      .select("lesson_id, watched_seconds, completed, completed_at")
      .eq("user_id", userId)
      .eq("course_id", courseId),
    supabase
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", courseId),
  ]);

  const lessons = (progressRows ?? []).map((row) => ({
    lesson_id: row.lesson_id as string,
    watched_seconds: row.watched_seconds as number,
    completed: row.completed as boolean,
    completed_at: row.completed_at as string | null,
  }));

  const completedCount = lessons.filter((row) => row.completed).length;
  const total = totalLessons ?? 0;
  const completionPercent =
    total > 0 ? Math.min(100, Math.round((completedCount / total) * 100)) : 0;

  return {
    lessons,
    completed_count: completedCount,
    total_lessons: total,
    completion_percent: completionPercent,
  };
}
