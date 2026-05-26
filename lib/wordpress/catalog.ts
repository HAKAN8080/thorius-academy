import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getAllCourseStats } from "@/lib/actions/course-stats";
import {
  enrichCategoriesFromCourses,
  fetchCategoryList,
  fetchCoursesForListing,
} from "@/lib/wordpress/api";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  COURSE_PRODUCTS_CACHE_TAG,
  COURSE_STATS_CACHE_TAG,
} from "@/lib/wordpress/cache-tags";
import type { CourseStats } from "@/lib/actions/course-stats";
import type { CourseProduct } from "@/types/course-product";
import type { Course, WPCategory } from "@/types/wordpress";

const REVALIDATE_SECONDS = 3600;

export interface CourseCatalog {
  courses: Course[];
  categories: WPCategory[];
  products: CourseProduct[];
  stats: Record<string, CourseStats>;
}

async function buildCourseCatalog(): Promise<CourseCatalog> {
  const [courses, categories, products, stats] = await Promise.all([
    fetchCoursesForListing(),
    fetchCategoryList(),
    getAllCourseProducts(),
    getAllCourseStats(),
  ]);

  return {
    courses,
    categories: enrichCategoriesFromCourses(categories, courses),
    products,
    stats,
  };
}

export async function getCourseCatalog(): Promise<CourseCatalog> {
  return unstable_cache(buildCourseCatalog, ["course-catalog"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [
      COURSE_CACHE_TAG,
      COURSE_CATEGORY_CACHE_TAG,
      COURSE_STATS_CACHE_TAG,
      COURSE_PRODUCTS_CACHE_TAG,
    ],
  })();
}
