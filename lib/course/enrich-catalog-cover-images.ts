import { unstable_cache } from "next/cache";
import { fetchCoursesForListing } from "@/lib/wordpress/api";
import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";

const REVALIDATE_SECONDS = 3600;

export function normalizeCoverImageUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `https://thorius.com.tr${trimmed}`;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }

  return trimmed;
}

const getWpFeaturedImageBySlug = unstable_cache(
  async () => {
    const courses = await fetchCoursesForListing();
    const map = new Map<string, string>();

    for (const course of courses) {
      const image = normalizeCoverImageUrl(course.featuredImage);
      if (image) {
        map.set(course.slug, image);
      }
    }

    return map;
  },
  ["wp-course-featured-images-by-slug"],
  { revalidate: REVALIDATE_SECONDS },
);

export async function enrichCatalogCoverImages(
  courses: CatalogCourseItem[],
): Promise<void> {
  const needsFallback = courses.some(
    (course) => !normalizeCoverImageUrl(course.coverImageUrl),
  );

  const wpImages = needsFallback ? await getWpFeaturedImageBySlug() : null;

  for (const course of courses) {
    const normalized = normalizeCoverImageUrl(course.coverImageUrl);
    course.coverImageUrl =
      normalized ?? wpImages?.get(course.slug) ?? null;
  }
}
