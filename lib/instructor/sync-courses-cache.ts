import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

  let synced = 0;

  for (const row of stats as StatsRow[]) {
    const published = row.status === "publish";
    const payload = {
      wp_course_id: row.wp_course_id,
      instructor_wp_user_id: wpInstructorId,
      course_slug: row.course_slug,
      title: row.title,
      cover_image_url: row.image_url,
      published,
      updated_at: new Date().toISOString(),
    };

    const { data: existing } = await admin
      .from("courses_cache")
      .select("id")
      .eq("wp_course_id", row.wp_course_id)
      .maybeSingle();

    if (existing) {
      const { error: updateError } = await admin
        .from("courses_cache")
        .update(payload)
        .eq("wp_course_id", row.wp_course_id);

      if (!updateError) {
        synced += 1;
      }
    } else {
      const { error: insertError } = await admin
        .from("courses_cache")
        .insert(payload);

      if (!insertError) {
        synced += 1;
      }
    }
  }

  return synced;
}
