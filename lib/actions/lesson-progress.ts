"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LessonProgress } from "@/types/lesson";

async function syncEnrollmentProgress(
  userId: string,
  courseId: number,
  courseSlug?: string,
  wpLessonId?: number,
) {
  const supabase = await createClient();

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

  if (wpLessonId) {
    updatePayload.last_lesson_id = wpLessonId;
  }

  await supabase
    .from("enrollments")
    .update(updatePayload)
    .eq("user_id", userId)
    .eq("course_id", courseId);

  revalidatePath("/panel/kurslarim");
  if (courseSlug) {
    revalidatePath(`/panel/kurslarim/${courseSlug}`);
  }
}

export async function updateLessonProgress(params: {
  lessonId: string;
  courseId: number;
  courseSlug?: string;
  wpLessonId?: number;
  watchedSeconds: number;
  completed?: boolean;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Login required" };

  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: params.lessonId,
      course_id: params.courseId,
      watched_seconds: params.watchedSeconds,
      completed: params.completed ?? false,
      completed_at: params.completed ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );

  if (error) return { success: false, error: error.message };

  await syncEnrollmentProgress(
    user.id,
    params.courseId,
    params.courseSlug,
    params.wpLessonId,
  );

  return { success: true };
}

export async function getUserLessonProgress(
  courseId: number,
): Promise<LessonProgress[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("course_id", courseId);

  return (data as LessonProgress[]) || [];
}

export async function markLessonComplete(params: {
  lessonId: string;
  courseId: number;
  courseSlug?: string;
  wpLessonId: number;
}) {
  return updateLessonProgress({
    lessonId: params.lessonId,
    courseId: params.courseId,
    courseSlug: params.courseSlug,
    wpLessonId: params.wpLessonId,
    watchedSeconds: 0,
    completed: true,
  });
}
