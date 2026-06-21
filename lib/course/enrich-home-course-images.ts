import type { Course } from "@/types/wordpress";
import {
  fetchWpCoverImageBySlug,
  fetchWpCoverImagesByWpIds,
} from "@/lib/course/resolve-course-cover-image";

const MAX_SLUG_FALLBACKS = 48;

export async function enrichHomeCourseFeaturedImages(
  courses: Course[],
): Promise<void> {
  let missing = courses.filter((course) => !course.featuredImage);
  if (missing.length === 0) {
    return;
  }

  try {
    const byId = await fetchWpCoverImagesByWpIds(missing.map((course) => course.id));
    for (const course of missing) {
      const cover = byId[course.id];
      if (cover) {
        course.featuredImage = cover;
      }
    }
  } catch (error) {
    console.error("[enrich-home-course-images] batch fetch failed:", error);
  }

  missing = courses.filter((course) => !course.featuredImage);
  await Promise.all(
    missing.slice(0, MAX_SLUG_FALLBACKS).map(async (course) => {
      const cover = await fetchWpCoverImageBySlug(course.slug);
      if (cover) {
        course.featuredImage = cover;
      }
    }),
  );
}
