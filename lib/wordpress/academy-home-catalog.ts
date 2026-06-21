import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getCourseStatsMap } from "@/lib/actions/course-stats";
import {
  enrichCategoriesFromCourses,
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

/** Hero + vitrin için zorunlu WP kategori slug'ları. */
const PRIORITY_CATEGORY_SLUGS = ["planlama", "insan-kaynaklari"] as const;

/** Ana sayfa vitrininde kullanılan ek WP kategori slug'ları. */
const HOME_CATEGORY_SLUGS = [
  ...PRIORITY_CATEGORY_SLUGS,
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
  const extraSlugs = HOME_CATEGORY_SLUGS.filter(
    (slug) =>
      !PRIORITY_CATEGORY_SLUGS.includes(
        slug as (typeof PRIORITY_CATEGORY_SLUGS)[number],
      ),
  );

  const results = await Promise.all([
    fetchCategoryList(),
    getAllCourseProducts(),
    ...PRIORITY_CATEGORY_SLUGS.map((slug) => fetchCategoryCourses(slug)),
    ...extraSlugs.map((slug) => fetchCategoryCourses(slug)),
  ]);

  const categories = results[0] as Awaited<ReturnType<typeof fetchCategoryList>>;
  const products = results[1] as Awaited<ReturnType<typeof getAllCourseProducts>>;
  const categoryBatches = results.slice(2) as Course[][];

  const courseById = new Map<number, Course>();
  for (const batch of categoryBatches) {
    for (const course of batch) {
      courseById.set(course.id, course);
    }
  }

  const courses = Array.from(courseById.values());
  const statsMap = await getCourseStatsMap(
    courses.map((course) => ({ id: course.id, slug: course.slug })),
  );
  const stats = Object.fromEntries(statsMap);

  return {
    courses,
    categories: enrichCategoriesFromCourses(categories, courses),
    products,
    stats,
  };
}

const getCachedAcademyHomeCatalog = unstable_cache(
  buildAcademyHomeCatalog,
  ["academy-home-catalog-v2"],
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
  return getCourseCatalog();
}
