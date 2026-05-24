"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { LessonProgress } from "@/types/lesson";

export async function updateLessonProgress(params: {
  lessonId: string;
  courseId: number;
  courseSlug?: string;
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
    { onConflict: "user_id,lesson_id" }
  );

  if (error) return { success: false, error: error.message };

  if (params.courseSlug) {
    revalidatePath(`/panel/kurslarim/${params.courseSlug}`);
  }

  return { success: true };
}

export async function getUserLessonProgress(
  courseId: number
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

export async function markLessonComplete(
  lessonId: string,
  courseId: number,
  courseSlug?: string
) {
  return updateLessonProgress({
    lessonId,
    courseId,
    courseSlug,
    watchedSeconds: 0,
    completed: true,
  });
}
