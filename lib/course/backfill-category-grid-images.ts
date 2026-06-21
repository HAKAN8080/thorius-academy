import {
  fetchWpCoverImageBySlug,
} from "@/lib/course/resolve-course-cover-image";
import {
  CATEGORY_IMAGE_COURSE_SLUG,
} from "@/lib/wordpress/api";
import type { Course, WPCategory } from "@/types/wordpress";

export async function backfillCategoryGridImages(
  categories: WPCategory[],
  courses: Course[],
): Promise<WPCategory[]> {
  return Promise.all(
    categories.map(async (category) => {
      if (category.image) {
        return category;
      }

      const overrideSlug = CATEGORY_IMAGE_COURSE_SLUG[category.slug];
      if (overrideSlug) {
        const overrideCover = await fetchWpCoverImageBySlug(overrideSlug);
        if (overrideCover) {
          return { ...category, image: overrideCover };
        }
      }

      const categoryCourses = courses.filter((course) =>
        course.categories.some((item) => item.id === category.id),
      );

      for (const course of categoryCourses) {
        const cover =
          course.featuredImage ?? (await fetchWpCoverImageBySlug(course.slug));
        if (cover) {
          return { ...category, image: cover };
        }
      }

      return category;
    }),
  );
}
