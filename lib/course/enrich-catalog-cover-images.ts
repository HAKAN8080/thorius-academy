import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";
import {
  fetchWpCoverImageBySlug,
  fetchWpCoverImagesByWpIds,
  normalizeCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

/** Matches COURSES_CATALOG_PER_PAGE — slug fallback must cover a full listing page. */
const PER_SLUG_CONCURRENCY = 4;
const SLUG_FETCH_TIMEOUT_MS = 2500;
const ENRICH_BUDGET_MS = 15000;
const MAX_SLUG_FALLBACKS = 24;

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

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T | null> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timeoutId = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } catch {
    return null;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export async function enrichCatalogCoverImages(
  courses: CatalogCourseItem[],
  options?: { skipSlugFallback?: boolean; maxSlugFallbacks?: number },
): Promise<void> {
  if (courses.length === 0) {
    return;
  }

  for (const course of courses) {
    course.coverImageUrl = normalizeCoverImageUrl(course.coverImageUrl);
  }

  let missing = courses.filter((course) => !course.coverImageUrl);
  if (missing.length === 0) {
    return;
  }

  const wpCourseIds = missing
    .map((course) => course.wpCourseId)
    .filter((id): id is number => id != null && id > 0);

  if (wpCourseIds.length > 0) {
    let byWpId: Record<number, string> = {};
    try {
      byWpId = await fetchWpCoverImagesByWpIds(wpCourseIds);
    } catch (error) {
      console.error("[enrich-catalog-cover-images] batch fetch failed:", error);
    }

    for (const course of missing) {
      if (!course.wpCourseId) {
        continue;
      }
      const cover = byWpId[course.wpCourseId];
      if (cover) {
        course.coverImageUrl = cover;
      }
    }
  }

  missing = courses.filter((course) => !course.coverImageUrl);
  if (missing.length === 0 || options?.skipSlugFallback) {
    return;
  }

  const maxSlugFallbacks = options?.maxSlugFallbacks ?? MAX_SLUG_FALLBACKS;
  const deadline = Date.now() + ENRICH_BUDGET_MS;
  await mapWithConcurrency(
    missing.slice(0, maxSlugFallbacks),
    PER_SLUG_CONCURRENCY,
    async (course) => {
      if (Date.now() > deadline) {
        return;
      }

      const cover = await withTimeout(
        fetchWpCoverImageBySlug(course.slug),
        SLUG_FETCH_TIMEOUT_MS,
      );
      if (cover) {
        course.coverImageUrl = cover;
      }
    },
  );
}

export { normalizeCoverImageUrl };
