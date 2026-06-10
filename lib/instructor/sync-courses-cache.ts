import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { buildCoursesCacheDraftPayload } from "@/lib/instructor/course-cache-access";

interface StatsRow {
  wp_course_id: number;
  course_slug: string;
  instructor_wp_user_id: number;
  title: string;
  image_url: string | null;
  status: string;
}

export async function ensureCoursesCacheForInstructor(
  wpInstructorId: number,
): Promise<number> {
  const admin = getSupabaseAdmin();

  const { data: stats, error } = await admin
    .from("instructor_course_stats")
    .select(
      "wp_course_id, course_slug, instructor_wp_user_id, title, image_url, status",
    )
    .eq("instructor_wp_user_id", wpInstructorId);

  if (error || !stats?.length) {
    return 0;
  }

  const wpIds = (stats as StatsRow[]).map((row) => row.wp_course_id);
  const { data: existingRows } = await admin
    .from("courses_cache")
    .select("wp_course_id")
    .in("wp_course_id", wpIds);

  const existingWpIds = new Set(
    (existingRows ?? []).map((row) => row.wp_course_id as number),
  );

  const missingStats = (stats as StatsRow[]).filter(
    (row) => !existingWpIds.has(row.wp_course_id),
  );

  if (missingStats.length === 0) {
    return 0;
  }

  const payloads = missingStats.map((row) => {
    const published = row.status === "publish";
    return buildCoursesCacheDraftPayload(
      {
        wp_course_id: row.wp_course_id,
        instructor_wp_user_id: wpInstructorId,
        title: row.title,
        cover_image_url: row.image_url,
        published,
        updated_at: new Date().toISOString(),
      },
      row.course_slug,
    );
  });

  const { error: upsertError } = await admin
    .from("courses_cache")
    .upsert(payloads, { onConflict: "wp_course_id" });

  if (upsertError) {
    console.warn(
      "[courses_cache] Instructor sync failed:",
      upsertError.message,
    );
    return 0;
  }

  return payloads.length;
}
