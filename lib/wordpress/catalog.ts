import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getAllCourseStats } from "@/lib/actions/course-stats";
import { getCourseStatsMap } from "@/lib/actions/course-stats";
import {
  enrichCategoriesFromCourses,
  fetchCategoryList,
  fetchCoursesForListing,
  fetchCoursesListingPage,
  fetchPublishedCourseTotal,
} from "@/lib/wordpress/api";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  COURSE_LISTING_CACHE_TAG,
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

export interface CourseListingPageData {
  courses: Course[];
  categories: WPCategory[];
  products: CourseProduct[];
  stats: Record<string, CourseStats>;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  totalPublished: number;
  selectedCategory?: string;
}

async function buildCourseListingPage(params: {
  page?: number;
  categorySlug?: string;
}): Promise<CourseListingPageData> {
  const [listing, categories, products, totalPublished] = await Promise.all([
    fetchCoursesListingPage({
      page: params.page,
      categorySlug: params.categorySlug,
    }),
    fetchCategoryList(),
    getAllCourseProducts(),
    fetchPublishedCourseTotal(),
  ]);

  const slugs = new Set(listing.courses.map((course) => course.slug));
  const pageProducts = products.filter((product) =>
    slugs.has(product.course_slug),
  );
  const statsMap = await getCourseStatsMap(
    listing.courses.map((course) => ({
      id: course.id,
      slug: course.slug,
    })),
  );
  const stats: Record<string, CourseStats> = Object.fromEntries(statsMap);

  return {
    courses: listing.courses,
    categories,
    products: pageProducts,
    stats,
    pagination: {
      page: listing.page,
      totalPages: listing.totalPages,
      total: listing.total,
      perPage: listing.perPage,
    },
    totalPublished,
    selectedCategory: params.categorySlug,
  };
}

export async function getCourseListingPage(params: {
  page?: number;
  categorySlug?: string;
}): Promise<CourseListingPageData> {
  const page = params.page ?? 1;
  const categorySlug = params.categorySlug ?? "all";

  return unstable_cache(
    () => buildCourseListingPage(params),
    ["course-listing", categorySlug, String(page)],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [
        COURSE_LISTING_CACHE_TAG,
        COURSE_CACHE_TAG,
        COURSE_CATEGORY_CACHE_TAG,
        COURSE_STATS_CACHE_TAG,
        COURSE_PRODUCTS_CACHE_TAG,
      ],
    },
  )();
}
