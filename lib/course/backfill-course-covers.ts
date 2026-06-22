import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  fetchWpCoverImageBySlugFresh,
  fetchWpCoverImagesByWpIdsFresh,
  isWpYoutubeMirrorUrl,
  normalizeCoverImageUrl,
  pickBestCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

const SLUG_CONCURRENCY = 4;

export interface BackfillCourseCoversOptions {
  dryRun?: boolean;
  /** Yalnızca boş veya WP YouTube ayna URL'si olan kayıtlar (varsayılan: true) */
  onlyMissing?: boolean;
  /** Tüm yayında kursların kapağını WP'den yeniden yazar */
  force?: boolean;
  limit?: number;
}

export interface BackfillCourseCoversResult {
  scanned: number;
  candidates: number;
  resolved: number;
  updated: number;
  skipped: number;
  unresolved: string[];
  dryRun: boolean;
}

interface CourseCacheRow {
  id: string;
  wp_course_id: number | null;
  course_slug: string | null;
  title: string | null;
  cover_image_url: string | null;
}

function needsCoverBackfill(
  row: CourseCacheRow,
  options: BackfillCourseCoversOptions,
): boolean {
  if (options.force) {
    return true;
  }

  if (options.onlyMissing === false) {
    return true;
  }

  const current = normalizeCoverImageUrl(row.cover_image_url);
  return !current || isWpYoutubeMirrorUrl(current);
}

async function mapWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<void> {
  let index = 0;

  async function runWorker() {
    while (index < items.length) {
      const current = items[index];
      index += 1;
      await worker(current);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, runWorker),
  );
}

export async function backfillCourseCovers(
  options: BackfillCourseCoversOptions = {},
): Promise<BackfillCourseCoversResult> {
  const dryRun = options.dryRun ?? false;
  const onlyMissing = options.force ? false : (options.onlyMissing ?? true);
  const admin = getSupabaseAdmin();

  const { data, error } = await admin
    .from("courses_cache")
    .select("id, wp_course_id, course_slug, title, cover_image_url")
    .eq("published", true)
    .not("course_slug", "is", null)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`courses_cache okunamadı: ${error.message}`);
  }

  let rows = (data ?? []) as CourseCacheRow[];
  if (options.limit != null && options.limit > 0) {
    rows = rows.slice(0, options.limit);
  }

  const candidates = rows.filter((row) =>
    needsCoverBackfill(row, { ...options, onlyMissing }),
  );

  const resolvedByCacheId = new Map<string, string>();
  const wpIds = candidates
    .map((row) => row.wp_course_id)
    .filter((id): id is number => id != null && id > 0);

  if (wpIds.length > 0) {
    const byWpId = await fetchWpCoverImagesByWpIdsFresh(wpIds);
    for (const row of candidates) {
      if (!row.wp_course_id) {
        continue;
      }
      const wpCover = byWpId[row.wp_course_id];
      const picked = pickBestCoverImageUrl({
        coverImageUrl: row.cover_image_url,
        fallbackUrl: wpCover,
      });
      if (picked) {
        resolvedByCacheId.set(row.id, picked);
      }
    }
  }

  const slugMissing = candidates.filter((row) => {
    if (resolvedByCacheId.has(row.id)) {
      return false;
    }
    return Boolean(row.course_slug?.trim());
  });

  await mapWithConcurrency(slugMissing, SLUG_CONCURRENCY, async (row) => {
    const slug = row.course_slug?.trim();
    if (!slug) {
      return;
    }

    const wpCover = await fetchWpCoverImageBySlugFresh(slug);
    const picked = pickBestCoverImageUrl({
      coverImageUrl: row.cover_image_url,
      fallbackUrl: wpCover,
    });
    if (picked) {
      resolvedByCacheId.set(row.id, picked);
    }
  });

  let updated = 0;
  let skipped = 0;
  const unresolved: string[] = [];

  for (const row of candidates) {
    const resolved = resolvedByCacheId.get(row.id);
    if (!resolved) {
      unresolved.push(row.course_slug ?? row.id);
      continue;
    }

    const current = normalizeCoverImageUrl(row.cover_image_url);
    if (current === resolved) {
      skipped += 1;
      continue;
    }

    if (dryRun) {
      updated += 1;
      continue;
    }

    const { error: updateError } = await admin
      .from("courses_cache")
      .update({
        cover_image_url: resolved,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateError) {
      console.error(
        `[backfill-covers] courses_cache update failed (${row.course_slug}):`,
        updateError.message,
      );
      unresolved.push(row.course_slug ?? row.id);
      continue;
    }

    if (row.wp_course_id != null && row.wp_course_id > 0) {
      const { error: statsError } = await admin
        .from("instructor_course_stats")
        .update({ image_url: resolved })
        .eq("wp_course_id", row.wp_course_id);

      if (statsError) {
        console.warn(
          `[backfill-covers] instructor_course_stats update failed (${row.wp_course_id}):`,
          statsError.message,
        );
      }
    }

    updated += 1;
  }

  return {
    scanned: rows.length,
    candidates: candidates.length,
    resolved: resolvedByCacheId.size,
    updated,
    skipped,
    unresolved,
    dryRun,
  };
}
