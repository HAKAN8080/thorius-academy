"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { syncLessonsFromTutor } from "@/lib/lessons/sync-from-tutor";
import type { Lesson } from "@/types/lesson";

export async function syncCourseFromTutor(
  courseId: number,
  courseSlug: string,
) {
  const supabase = await createClient();
  const result = await syncLessonsFromTutor(supabase, courseId, courseSlug);

  if (result.success) {
    revalidatePath(`/panel/kurslarim/${courseSlug}`);
  }

  return result;
}

export async function getLessonsForCourse(
  courseSlug: string,
): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_slug", courseSlug)
    .order("topic_order", { ascending: true })
    .order("lesson_order", { ascending: true });

  if (error) {
    console.error("Get lessons error:", error);
    return [];
  }

  return (data as Lesson[]) || [];
}
