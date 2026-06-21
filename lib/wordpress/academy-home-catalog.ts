import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getCourseStatsMap } from "@/lib/actions/course-stats";
import {
  enrichCategoriesFromCourses,
  fetchCategoryList,
  fetchCoursesByCategory,
} from "@/lib/wordpress/api";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  COURSE_PRODUCTS_CACHE_TAG,
  COURSE_STATS_CACHE_TAG,
} from "@/lib/wordpress/cache-tags";
import type { CourseCatalog } from "@/lib/wordpress/catalog";
import type { Course } from "@/types/wordpress";

const REVALIDATE_SECONDS = 3600;

/** Ana sayfa vitrininde kullanılan WP kategori slug'ları (tam katalog çekilmez). */
const HOME_CATEGORY_SLUGS = [
  "planlama",
  "ai",
  "insan-kaynaklari",
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

async function buildAcademyHomeCatalog(): Promise<CourseCatalog> {
  const [categories, products, ...categoryCourseBatches] = await Promise.all([
    fetchCategoryList(),
    getAllCourseProducts(),
    ...HOME_CATEGORY_SLUGS.map((slug) =>
      fetchCoursesByCategory(slug).catch((error) => {
        console.error(`[academy-home-catalog] category fetch failed: ${slug}`, error);
        return [];
      }),
    ),
  ]);

  const courseById = new Map<number, Course>();
  for (const batch of categoryCourseBatches) {
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

export async function getAcademyHomeCatalog(): Promise<CourseCatalog> {
  return unstable_cache(buildAcademyHomeCatalog, ["academy-home-catalog-v1"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [
      COURSE_CACHE_TAG,
      COURSE_CATEGORY_CACHE_TAG,
      COURSE_PRODUCTS_CACHE_TAG,
      COURSE_STATS_CACHE_TAG,
    ],
  })();
}
