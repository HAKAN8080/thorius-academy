import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export async function resolveWpCourseIdsForLessons(
  courseSlug: string,
  courseId?: number,
): Promise<number[]> {
  const admin = getSupabaseAdmin();
  const ids = new Set<number>();

  if (typeof courseId === "number" && Number.isFinite(courseId)) {
    ids.add(courseId);
  }

  const slugVariants = getCourseSlugLookupVariants(courseSlug);
  const { data: cacheRows } = await admin
    .from("courses_cache")
    .select("wp_course_id")
    .in("course_slug", slugVariants);

  for (const row of cacheRows ?? []) {
    if (typeof row.wp_course_id === "number") {
      ids.add(row.wp_course_id);
    }
  }

  const { data: lessonRows } = await admin
    .from("lessons")
    .select("course_id")
    .in("course_slug", slugVariants);

  for (const row of lessonRows ?? []) {
    if (typeof row.course_id === "number") {
      ids.add(row.course_id);
    }
  }

  return Array.from(ids);
}
