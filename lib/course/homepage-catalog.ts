import { unstable_cache } from "next/cache";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getAllCourseStats } from "@/lib/actions/course-stats";
import {
  buildCategories,
  type CatalogCourseItem,
} from "@/lib/course/courses-cache-catalog";
import { resolveCourseLanguageMeta } from "@/lib/course/course-language";
import { pickLocalized } from "@/lib/course/resolve-course-content";
import type { AppLocale } from "@/i18n/routing";
import { enrichCatalogWithCourseProducts } from "@/lib/course/enrich-catalog-with-products";
import {
  canonicalizeCategorySlug,
  slugifyCategoryName,
} from "@/lib/course/category-slug";
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
  "id,course_slug,wp_course_id,title,title_en,subtitle,description_md,description_md_en,cover_image_url,category,level,language,subtitle_language,pricing_model,price,sale_price,updated_at";

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

function mapCatalogRow(
  row: Record<string, unknown>,
  locale: AppLocale = "tr",
): CatalogCourseItem | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  const pricingModel = row.pricing_model === "paid" ? "paid" : "free";
  const price = Number(row.price ?? 0);
  const salePrice =
    row.sale_price == null || row.sale_price === ""
      ? null
      : Number(row.sale_price);

  const languageMeta = resolveCourseLanguageMeta(
    row.language as string | null | undefined,
    row.subtitle_language as string | null | undefined,
    {
      subtitle: row.subtitle as string | null | undefined,
      descriptionMd: row.description_md as string | null | undefined,
    },
  );

  return {
    id: String(row.id),
    slug,
    wpCourseId:
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    title:
      pickLocalized(
        locale,
        row.title as string | null,
        row.title_en as string | null,
      ) || "Kurs",
    description: excerptFromMarkdown(
      pickLocalized(
        locale,
        row.description_md as string | null,
        row.description_md_en as string | null,
      ) || (row.description_md as string | null),
    ),
    coverImageUrl: (row.cover_image_url as string | null) ?? null,
    category: (row.category as string | null)?.trim() || null,
    level: fromCoursesCacheLevelLabel(row.level as string | null | undefined),
    language: languageMeta.language,
    subtitleLanguage: languageMeta.subtitleLanguage,
    pricingModel,
    price,
    salePrice,
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
    language: item.language,
    subtitleLanguage: item.subtitleLanguage,
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

interface HomepageCatalogRaw {
  catalogItems: CatalogCourseItem[];
  categoryRows: Array<{ category: string | null }>;
  products: CourseProduct[];
  stats: Record<string, CourseStats>;
}

async function buildHomepageCatalog(locale: AppLocale): Promise<HomepageCatalogRaw> {
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
    .map((row) => mapCatalogRow(row as Record<string, unknown>, locale))
    .filter((course): course is CatalogCourseItem => course !== null);

  const categoryRows = catalogItems.map((course) => ({
    category: course.category,
  }));

  const [products, stats] = await Promise.all([
    getAllCourseProducts(),
    getAllCourseStats(),
  ]);

  return { catalogItems, categoryRows, products, stats };
}

async function finalizeHomepageCatalog(
  raw: HomepageCatalogRaw,
): Promise<HomepageCatalog> {
  const enrichedCatalogItems = await enrichCatalogWithCourseProducts(
    raw.catalogItems,
  );
  const categories = mapToWpCategories(
    buildCategories(raw.categoryRows),
    enrichedCatalogItems,
  );
  const courses = enrichedCatalogItems.map(mapToCourse);

  return {
    courses,
    categories,
    products: raw.products,
    stats: raw.stats,
  };
}

export async function getHomepageCatalogFromCache(
  locale: AppLocale = "tr",
): Promise<HomepageCatalog> {
  const raw = await unstable_cache(
    () => buildHomepageCatalog(locale),
    ["homepage-catalog-v8", locale],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [
        COURSE_CACHE_TAG,
        COURSE_CATEGORY_CACHE_TAG,
        COURSE_STATS_CACHE_TAG,
        COURSE_PRODUCTS_CACHE_TAG,
        "courses-cache-catalog",
      ],
    },
  )();

  return finalizeHomepageCatalog(raw);
}
