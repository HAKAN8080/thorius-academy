import { unstable_cache } from "next/cache";
import { fetchCoursesForListing } from "@/lib/wordpress/api";
import type { CatalogCourseItem } from "@/lib/course/courses-cache-catalog";
import {
  fetchWpCoverImageBySlug,
  normalizeCoverImageUrl,
  pickBestCoverImageUrl,
} from "@/lib/course/resolve-course-cover-image";

const REVALIDATE_SECONDS = 3600;

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
  if (courses.length === 0) {
    return;
  }

  const wpImages = await getWpFeaturedImageBySlug();
  const missingSlugs = new Set<string>();

  for (const course of courses) {
    course.coverImageUrl = pickBestCoverImageUrl({
      coverImageUrl: course.coverImageUrl,
      fallbackUrl: wpImages.get(course.slug),
    });

    if (!course.coverImageUrl) {
      missingSlugs.add(course.slug);
    }
  }

  if (missingSlugs.size === 0) {
    return;
  }

  await Promise.all(
    Array.from(missingSlugs, async (slug) => {
      const image = await fetchWpCoverImageBySlug(slug);
      if (!image) {
        return;
      }

      for (const course of courses) {
        if (course.slug === slug) {
          course.coverImageUrl = pickBestCoverImageUrl({
            coverImageUrl: course.coverImageUrl,
            fallbackUrl: image,
          });
        }
      }
    }),
  );
}

export { normalizeCoverImageUrl };
