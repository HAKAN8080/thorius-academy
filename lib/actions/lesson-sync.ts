"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { syncLessonsFromTutor } from "@/lib/lessons/sync-from-tutor";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Lesson } from "@/types/lesson";

export async function syncCourseFromTutor(
  courseId: number,
  courseSlug: string,
) {
  const result = await syncLessonsFromTutor(
    getSupabaseAdmin(),
    courseId,
    courseSlug,
  );

  if (result.success) {
    for (const slug of getCourseSlugLookupVariants(courseSlug)) {
      revalidatePath(`/panel/kurslarim/${slug}`);
    }
  }

  return result;
}

export async function getLessonsForCourse(
  courseSlug: string,
): Promise<Lesson[]> {
  const slugVariants = getCourseSlugLookupVariants(courseSlug);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .in("course_slug", slugVariants)
    .order("topic_order", { ascending: true })
    .order("lesson_order", { ascending: true });

  if (error) {
    console.error("Get lessons error:", error);
    return [];
  }

  const lessons = (data as Lesson[]) || [];
  const seen = new Set<number>();

  return lessons.filter((lesson) => {
    if (seen.has(lesson.wp_lesson_id)) {
      return false;
    }
    seen.add(lesson.wp_lesson_id);
    return true;
  });
}
