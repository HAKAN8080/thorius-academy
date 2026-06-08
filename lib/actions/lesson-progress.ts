"use server";

import { createClient } from "@/lib/supabase/server";
import {
  getCourseProgressForUser,
  upsertLessonProgress,
} from "@/lib/progress/lesson-progress-service";
import type { LessonProgress } from "@/types/lesson";

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

  return upsertLessonProgress(
    user.id,
    {
      lesson_id: params.lessonId,
      course_id: params.courseId,
      watched_seconds: params.watchedSeconds,
      completed: params.completed,
    },
    {
      courseSlug: params.courseSlug,
      wpLessonId: params.wpLessonId,
    },
  );
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

export async function getUserCourseProgressSummary(courseId: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return getCourseProgressForUser(user.id, courseId);
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
