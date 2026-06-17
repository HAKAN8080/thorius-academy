import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";
import {
  fetchWpCoverImageBySlug,
  isWpYoutubeMirrorUrl,
  normalizeCoverImageUrl,
  pickBestCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

function courseNeedsCoverEnrichment(course: CatalogCourseItem): boolean {
  const cover = normalizeCoverImageUrl(course.coverImageUrl);
  return !cover || isWpYoutubeMirrorUrl(cover);
}

export async function enrichCatalogCoverImages(
  courses: CatalogCourseItem[],
): Promise<void> {
  const targets = courses.filter(courseNeedsCoverEnrichment);
  if (targets.length === 0) {
    return;
  }

  await Promise.all(
    targets.map(async (course) => {
      const wpCover = await fetchWpCoverImageBySlug(course.slug);
      course.coverImageUrl = pickBestCoverImageUrl({
        coverImageUrl: course.coverImageUrl,
        fallbackUrl: wpCover,
      });
    }),
  );
}

export { normalizeCoverImageUrl };
