"use server";

import { revalidatePath } from "next/cache";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { resolveWpCourseIdsForLessons } from "@/lib/lessons/resolve-course-lesson-ids";
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

export async function reconcileCourseLessons(
  courseSlug: string,
  courseId?: number,
): Promise<number> {
  const admin = getSupabaseAdmin();
  const wpCourseIds = await resolveWpCourseIdsForLessons(courseSlug, courseId);

  if (wpCourseIds.length === 0) {
    return 0;
  }

  const slugVariants = getCourseSlugLookupVariants(courseSlug);
  const canonicalSlug = slugVariants[0] ?? courseSlug;
  let updated = 0;

  for (const wpCourseId of wpCourseIds) {
    const { data: draftLessons } = await admin
      .from("lessons")
      .select("id, video_url, content_md, published")
      .eq("course_id", wpCourseId)
      .eq("published", false);

    for (const lesson of draftLessons ?? []) {
      const hasContent =
        Boolean(lesson.video_url?.trim()) || Boolean(lesson.content_md?.trim());
      if (!hasContent) {
        continue;
      }

      const { error } = await admin
        .from("lessons")
        .update({
          published: true,
          course_slug: canonicalSlug,
        })
        .eq("id", lesson.id);

      if (!error) {
        updated += 1;
      }
    }

    await admin
      .from("lessons")
      .update({ course_slug: canonicalSlug })
      .eq("course_id", wpCourseId);
  }

  if (updated > 0) {
    for (const slug of slugVariants) {
      revalidatePath(`/panel/kurslarim/${slug}`);
      revalidatePath(`/kurslar/${slug}`);
    }
  }

  return updated;
}

export async function getLessonsForCourse(
  courseSlug: string,
  courseId?: number,
): Promise<Lesson[]> {
  const admin = getSupabaseAdmin();
  const wpCourseIds = await resolveWpCourseIdsForLessons(courseSlug, courseId);
  const slugVariants = getCourseSlugLookupVariants(courseSlug);

  let query = admin.from("lessons").select("*").eq("published", true);

  if (wpCourseIds.length > 0) {
    query = query.in("course_id", wpCourseIds);
  } else {
    query = query.in("course_slug", slugVariants);
  }

  const { data, error } = await query
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

export async function getPreviewLessonById(
  courseSlug: string,
  courseId: number,
  lessonId: string,
): Promise<Lesson | null> {
  const admin = getSupabaseAdmin();
  const wpCourseIds = await resolveWpCourseIdsForLessons(courseSlug, courseId);

  let query = admin
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("published", true)
    .eq("is_free", true);

  if (wpCourseIds.length > 0) {
    query = query.in("course_id", wpCourseIds);
  } else {
    query = query.in("course_slug", getCourseSlugLookupVariants(courseSlug));
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as Lesson;
}
