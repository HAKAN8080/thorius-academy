import { isPurchasableCourseProduct } from "@/lib/course/course-product-utils";
import { canonicalizeCategorySlug } from "@/lib/course/category-slug";
import type { CourseProduct } from "@/types/course-product";
import type { Course, WPCategory } from "@/types/wordpress";

export function filterPurchasableCourses(
  courses: Course[],
  productBySlug: Map<string, CourseProduct>,
): Course[] {
  return courses.filter((course) => {
    const product = productBySlug.get(course.slug);
    return Boolean(product && isPurchasableCourseProduct(product));
  });
}

export function filterCoursesByCategorySlugs(
  courses: Course[],
  categorySlugs: string[],
): Course[] {
  const targets = new Set(categorySlugs.map(canonicalizeCategorySlug));

  return courses.filter((course) =>
    course.categories.some((category) =>
      targets.has(canonicalizeCategorySlug(category.slug)),
    ),
  );
}

function sortCoursesForDisplay(courses: Course[]): Course[] {
  return [...courses].sort((a, b) => {
    if (a.featuredImage && !b.featuredImage) {
      return -1;
    }
    if (!a.featuredImage && b.featuredImage) {
      return 1;
    }
    return (
      new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
    );
  });
}

function pickBestCourse(courses: Course[]): Course | undefined {
  if (courses.length === 0) {
    return undefined;
  }

  return sortCoursesForDisplay(courses)[0];
}

export function pickCoursesByCategorySlugs(
  courses: Course[],
  categorySlugs: string[],
  limit = 5,
): Course[] {
  const picked: Course[] = [];
  const usedIds = new Set<number>();

  for (const categorySlug of categorySlugs) {
    if (picked.length >= limit) {
      break;
    }

    const targetSlug = canonicalizeCategorySlug(categorySlug);

    const categoryCourses = sortCoursesForDisplay(
      courses.filter(
        (course) =>
          !usedIds.has(course.id) &&
          course.categories.some(
            (category) =>
              canonicalizeCategorySlug(category.slug) === targetSlug,
          ),
      ),
    );

    for (const course of categoryCourses) {
      if (picked.length >= limit) {
        break;
      }
      picked.push(course);
      usedIds.add(course.id);
    }
  }

  return picked;
}

export function pickCoursesByCategorySlug(
  courses: Course[],
  categorySlug: string,
  limit = 5,
): Course[] {
  return pickCoursesByCategorySlugs(courses, [categorySlug], limit);
}

/** Her kategoriden en fazla bir kurs — öne çıkan grid çeşitliliği için. */
export function pickFeaturedCoursesByCategory(
  courses: Course[],
  categories: WPCategory[],
  limit = 5,
): Course[] {
  const byCategoryId = new Map<number, Course[]>();

  for (const course of courses) {
    for (const category of course.categories) {
      const list = byCategoryId.get(category.id) ?? [];
      list.push(course);
      byCategoryId.set(category.id, list);
    }
  }

  const picked: Course[] = [];
  const usedIds = new Set<number>();

  for (const category of categories) {
    if (picked.length >= limit) {
      break;
    }

    const candidates = byCategoryId.get(category.id);
    const course = candidates ? pickBestCourse(candidates) : undefined;

    if (course && !usedIds.has(course.id)) {
      picked.push(course);
      usedIds.add(course.id);
    }
  }

  if (picked.length < limit) {
    for (const course of courses) {
      if (picked.length >= limit) {
        break;
      }
      if (!usedIds.has(course.id)) {
        picked.push(course);
        usedIds.add(course.id);
      }
    }
  }

  return picked;
}
