import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";
import {
  fetchWpCoverImageBySlug,
  getBulkWpCoverImageRecord,
  normalizeCoverImageUrl,
  pickBestCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

const PER_SLUG_CONCURRENCY = 6;

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

function courseNeedsCoverEnrichment(
  course: CatalogCourseItem,
  bulk: Record<string, string>,
): boolean {
  const picked = pickBestCoverImageUrl({
    coverImageUrl: course.coverImageUrl,
    fallbackUrl: bulk[course.slug],
  });
  return !picked;
}

export async function enrichCatalogCoverImages(
  courses: CatalogCourseItem[],
): Promise<void> {
  if (courses.length === 0) {
    return;
  }

  const bulk = await getBulkWpCoverImageRecord();

  for (const course of courses) {
    course.coverImageUrl = pickBestCoverImageUrl({
      coverImageUrl: course.coverImageUrl,
      fallbackUrl: bulk[course.slug],
    });
  }

  const missing = courses.filter((course) =>
    courseNeedsCoverEnrichment(course, bulk),
  );
  if (missing.length === 0) {
    return;
  }

  await mapWithConcurrency(missing, PER_SLUG_CONCURRENCY, async (course) => {
    const wpCover = await fetchWpCoverImageBySlug(course.slug);
    course.coverImageUrl = pickBestCoverImageUrl({
      coverImageUrl: course.coverImageUrl,
      fallbackUrl: wpCover,
    });
  });
}

export { normalizeCoverImageUrl };
