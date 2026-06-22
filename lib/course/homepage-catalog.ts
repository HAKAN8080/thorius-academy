import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getAllCourseStats } from "@/lib/actions/course-stats";
import {
  buildCategories,
  type CatalogCourseItem,
} from "@/lib/course/courses-cache-catalog";
import {
  canonicalizeCategorySlug,
  slugifyCategoryName,
} from "@/lib/course/category-slug";
import { enrichCatalogCoverImages } from "@/lib/course/enrich-catalog-cover-images";
import { enrichHomeCourseFeaturedImages } from "@/lib/course/enrich-home-course-images";
import { fromCoursesCacheLevelLabel } from "@/lib/instructor/courses-cache-write";
import { getSupabasePublicClient } from "@/lib/supabase/public";
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

const LISTING_SELECT =
  "id,course_slug,wp_course_id,title,description_md,cover_image_url,category,level,updated_at";

function stableNumericId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

function excerptFromMarkdown(
  markdown: string | null | undefined,
  max = 160,
): string {
  if (!markdown?.trim()) {
    return "";
  }

  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/[#>*_~\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function mapCatalogRow(row: Record<string, unknown>): CatalogCourseItem | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  return {
    id: String(row.id),
    slug,
    wpCourseId:
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    title: (row.title as string) || "Kurs",
    description: excerptFromMarkdown(row.description_md as string | null),
    coverImageUrl: (row.cover_image_url as string | null) ?? null,
    category: (row.category as string | null)?.trim() || null,
    level: fromCoursesCacheLevelLabel(row.level as string | null | undefined),
    pricingModel: "free",
    price: 0,
    salePrice: null,
  };
}

function mapCourseCategory(
  categoryName: string,
): Course["categories"][number] {
  const slug = slugifyCategoryName(categoryName);
  return {
    id: stableNumericId(slug),
    name: categoryName,
    slug,
  };
}

function mapToCourse(item: CatalogCourseItem): Course {
  const id =
    item.wpCourseId != null && item.wpCourseId > 0
      ? item.wpCourseId
      : stableNumericId(item.slug);

  return {
    id,
    slug: item.slug,
    title: item.title,
    excerpt: item.description,
    content: "",
    featuredImage: item.coverImageUrl,
    imageAlt: item.title,
    instructor: null,
    categories: item.category ? [mapCourseCategory(item.category)] : [],
    tags: [],
    wpLink: `/kurslar/${item.slug}`,
    publishedDate: new Date().toISOString(),
    level: item.level,
  };
}

function pickCategoryCoverImage(
  categorySlug: string,
  courses: CatalogCourseItem[],
): string | null {
  const canonical = canonicalizeCategorySlug(categorySlug);
  const categoryCourses = courses.filter((course) => {
    if (!course.category) {
      return false;
    }
    return canonicalizeCategorySlug(slugifyCategoryName(course.category)) === canonical;
  });

  return (
    categoryCourses.find((course) => course.coverImageUrl)?.coverImageUrl ??
    categoryCourses[0]?.coverImageUrl ??
    null
  );
}

function mapToWpCategories(
  catalogCategories: ReturnType<typeof buildCategories>,
  courses: CatalogCourseItem[],
): WPCategory[] {
  return catalogCategories.map((category) => ({
    id: stableNumericId(category.slug),
    name: category.name,
    slug: category.slug,
    description: "",
    count: category.count,
    taxonomy: "course-category",
    image: pickCategoryCoverImage(category.slug, courses),
  }));
}

export interface HomepageCatalog {
  courses: Course[];
  categories: WPCategory[];
  products: CourseProduct[];
  stats: Record<string, CourseStats>;
}

async function buildHomepageCatalog(): Promise<HomepageCatalog> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("courses_cache")
    .select(LISTING_SELECT)
    .eq("published", true)
    .eq("visibility", "public")
    .not("course_slug", "is", null)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("[homepage-catalog] courses_cache fetch failed:", error.message);
  }

  const catalogItems = (data ?? [])
    .map((row) => mapCatalogRow(row as Record<string, unknown>))
    .filter((course): course is CatalogCourseItem => course !== null);

  await enrichCatalogCoverImages(catalogItems, { maxSlugFallbacks: 24 });

  const categoryRows = catalogItems.map((course) => ({
    category: course.category,
  }));
  const categories = mapToWpCategories(buildCategories(categoryRows), catalogItems);
  const courses = catalogItems.map(mapToCourse);

  await enrichHomeCourseFeaturedImages(courses, { slugFallbackLimit: 12 });

  const [products, stats] = await Promise.all([
    getAllCourseProducts(),
    getAllCourseStats(),
  ]);

  return { courses, categories, products, stats };
}

export async function getHomepageCatalogFromCache(): Promise<HomepageCatalog> {
  return unstable_cache(buildHomepageCatalog, ["homepage-catalog-v3"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [
      COURSE_CACHE_TAG,
      COURSE_CATEGORY_CACHE_TAG,
      COURSE_STATS_CACHE_TAG,
      COURSE_PRODUCTS_CACHE_TAG,
      "courses-cache-catalog",
    ],
  })();
}
