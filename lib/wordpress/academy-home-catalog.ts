import { unstable_cache } from "next/cache";
import { enrichHomeCourseFeaturedImages } from "@/lib/course/enrich-home-course-images";
import { resolveAllCategoryCoverImages } from "@/lib/course/resolve-category-cover-image";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getCourseStatsMap } from "@/lib/actions/course-stats";
import {
  fetchCategoryList,
  fetchCoursesByCategory,
} from "@/lib/wordpress/api";
import { getCourseCatalog } from "@/lib/wordpress/catalog";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  COURSE_PRODUCTS_CACHE_TAG,
  COURSE_STATS_CACHE_TAG,
} from "@/lib/wordpress/cache-tags";
import type { CourseCatalog } from "@/lib/wordpress/catalog";
import type { Course } from "@/types/wordpress";

const REVALIDATE_SECONDS = 3600;
const MIN_COURSES_BEFORE_FALLBACK = 10;

const HOME_CATEGORY_SLUGS = [
  "planlama",
  "insan-kaynaklari",
  "ai",
  "bt",
  "ist",
  "ingilizce-egitimi",
  "mit-egitimleri",
  "yoga",
  "yazilim",
  "satranc",
  "kocluk",
  "tedarik-zinciri",
] as const;

async function fetchCategoryCourses(slug: string): Promise<Course[]> {
  try {
    return await fetchCoursesByCategory(slug);
  } catch (error) {
    console.error(`[academy-home-catalog] category fetch failed: ${slug}`, error);
    return [];
  }
}

async function buildAcademyHomeCatalog(): Promise<CourseCatalog> {
  const [categories, products, ...categoryBatches] = await Promise.all([
    fetchCategoryList(),
    getAllCourseProducts(),
    ...HOME_CATEGORY_SLUGS.map((slug) => fetchCategoryCourses(slug)),
  ]);

  const courseById = new Map<number, Course>();
  for (const batch of categoryBatches) {
    for (const course of batch) {
      courseById.set(course.id, course);
    }
  }

  const courses = Array.from(courseById.values());

  const [categoriesWithImages] = await Promise.all([
    resolveAllCategoryCoverImages(categories),
    enrichHomeCourseFeaturedImages(courses, { slugFallbackLimit: 12 }),
  ]);

  const statsMap = await getCourseStatsMap(
    courses.map((course) => ({ id: course.id, slug: course.slug })),
  );

  return {
    courses,
    categories: categoriesWithImages,
    products,
    stats: Object.fromEntries(statsMap),
  };
}

const getCachedAcademyHomeCatalog = unstable_cache(
  buildAcademyHomeCatalog,
  ["academy-home-catalog-v4"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: [
      COURSE_CACHE_TAG,
      COURSE_CATEGORY_CACHE_TAG,
      COURSE_PRODUCTS_CACHE_TAG,
      COURSE_STATS_CACHE_TAG,
    ],
  },
);

export async function getAcademyHomeCatalog(): Promise<CourseCatalog> {
  const catalog = await getCachedAcademyHomeCatalog();

  if (catalog.courses.length >= MIN_COURSES_BEFORE_FALLBACK) {
    return catalog;
  }

  console.warn(
    `[academy-home-catalog] only ${catalog.courses.length} courses loaded; falling back to full catalog`,
  );

  const fullCatalog = await getCourseCatalog();
  const categoriesWithImages = await resolveAllCategoryCoverImages(
    fullCatalog.categories,
  );

  return {
    ...fullCatalog,
    categories: categoriesWithImages,
  };
}
