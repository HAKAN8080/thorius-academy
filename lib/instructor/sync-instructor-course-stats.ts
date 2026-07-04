import { getSupabaseAdmin } from "@/lib/supabase/admin";

const MAX_STATS_BACKFILL_ROWS = 50;

interface CacheRow {
  wp_course_id: number;
  course_slug: string | null;
  instructor_wp_user_id: number;
  title: string;
  cover_image_url: string | null;
  published: boolean | null;
  updated_at: string | null;
}

export async function ensureInstructorCourseStatsFromCache(
  wpInstructorId: number,
): Promise<number> {
  const admin = getSupabaseAdmin();

  const { data: cacheRows, error } = await admin
    .from("courses_cache")
    .select(
      "wp_course_id, course_slug, instructor_wp_user_id, title, cover_image_url, published, updated_at",
    )
    .eq("instructor_wp_user_id", wpInstructorId)
    .not("wp_course_id", "is", null);

  if (error || !cacheRows?.length) {
    return 0;
  }

  const rows = cacheRows as CacheRow[];
  const wpIds = rows.map((row) => row.wp_course_id);

  const { data: existingStats } = await admin
    .from("instructor_course_stats")
    .select("wp_course_id")
    .in("wp_course_id", wpIds);

  const existingWpIds = new Set(
    (existingStats ?? []).map((row) => row.wp_course_id as number),
  );

  const missingRows = rows.filter((row) => !existingWpIds.has(row.wp_course_id));
  if (missingRows.length === 0 || missingRows.length > MAX_STATS_BACKFILL_ROWS) {
    return 0;
  }

  const syncedAt = new Date().toISOString();
  const payloads = missingRows
    .filter((row) => row.course_slug?.trim())
    .map((row) => ({
      wp_course_id: row.wp_course_id,
      course_slug: row.course_slug!.trim(),
      instructor_wp_user_id: wpInstructorId,
      title: row.title || "Kurs",
      image_url: row.cover_image_url,
      status: row.published ? "publish" : "draft",
      enrollment_count: 0,
      rating_avg: 0,
      rating_count: 0,
      published_at: row.published ? (row.updated_at ?? syncedAt) : null,
      synced_at: syncedAt,
    }));

  if (payloads.length === 0) {
    return 0;
  }

  const { error: upsertError } = await admin
    .from("instructor_course_stats")
    .upsert(payloads, { onConflict: "wp_course_id" });

  if (upsertError) {
    console.warn(
      "[instructor_course_stats] cache backfill failed:",
      upsertError.message,
    );
    return 0;
  }

  return payloads.length;
}
