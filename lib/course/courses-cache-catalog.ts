import { unstable_cache } from "next/cache";
import {
  canonicalizeCategorySlug,
  slugifyCategoryName,
} from "@/lib/course/category-slug";
import { enrichCatalogCoverImages } from "@/lib/course/enrich-catalog-cover-images";
import { fromCoursesCacheLevelLabel } from "@/lib/instructor/courses-cache-write";
import { getSupabasePublicClient } from "@/lib/supabase/public";

export const COURSES_CATALOG_PER_PAGE = 24;

const REVALIDATE_SECONDS = 3600;

const LISTING_SELECT =
  "id,course_slug,wp_course_id,title,description_md,cover_image_url,category,level,pricing_model,price,sale_price,updated_at";

export interface CatalogCourseItem {
  id: string;
  slug: string;
  wpCourseId: number | null;
  title: string;
  description: string;
  coverImageUrl: string | null;
  category: string | null;
  level: string;
  pricingModel: "free" | "paid";
  price: number;
  salePrice: number | null;
}

export interface CatalogCategoryItem {
  id: string;
  slug: string;
  name: string;
  count: number;
}

export interface CoursesCacheListingPage {
  courses: CatalogCourseItem[];
  categories: CatalogCategoryItem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  totalPublished: number;
  selectedCategory?: string;
  searchQuery?: string;
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

function excerptFromMarkdown(markdown: string | null | undefined, max = 120): string {
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

function mapRow(row: Record<string, unknown>): CatalogCourseItem | null {
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
    pricingModel,
    price,
    salePrice,
  };
}

function buildCategories(rows: Array<{ category: string | null }>): CatalogCategoryItem[] {
  const counts = new Map<string, { name: string; count: number }>();

  for (const row of rows) {
    const name = row.category?.trim();
    if (!name) {
      continue;
    }

    const slug = slugifyCategoryName(name);
    const existing = counts.get(slug);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(slug, { name, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([slug, value]) => ({
      id: slug,
      slug,
      name: value.name,
      count: value.count,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, "tr"));
}

function resolveCategoryName(
  categories: CatalogCategoryItem[],
  categorySlug?: string,
): string | undefined {
  if (!categorySlug) {
    return undefined;
  }

  const canonical = canonicalizeCategorySlug(categorySlug);

  const bySlug = categories.find(
    (category) =>
      category.slug === canonical ||
      category.slug === categorySlug ||
      slugifyCategoryName(category.name) === canonical,
  );

  return bySlug?.name;
}

async function fetchCategorySourceRows(): Promise<Array<{ category: string | null }>> {
  return getCachedCategorySourceRows();
}

const getCachedCategorySourceRows = unstable_cache(
  async () => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("courses_cache")
      .select("category")
      .eq("published", true)
      .eq("visibility", "public")
      .not("course_slug", "is", null);

    if (error) {
      console.error(
        "[courses-cache-catalog] category fetch failed:",
        error.message,
      );
      return [];
    }

    return (data ?? []) as Array<{ category: string | null }>;
  },
  ["courses-cache-category-rows"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["courses-cache-catalog"],
  },
);

async function buildCoursesCacheListingPage(params: {
  page?: number;
  categorySlug?: string;
  search?: string;
}): Promise<CoursesCacheListingPage> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = COURSES_CATALOG_PER_PAGE;
  const searchQuery = params.search?.trim() || undefined;
  const categorySlug = params.categorySlug
    ? canonicalizeCategorySlug(params.categorySlug)
    : undefined;
  const categoryRows = await fetchCategorySourceRows();
  const categories = buildCategories(categoryRows);
  const categoryName = resolveCategoryName(categories, categorySlug);

  if (categorySlug && !categoryName) {
    return {
      courses: [],
      categories,
      pagination: {
        page,
        totalPages: 0,
        total: 0,
        perPage,
      },
      totalPublished: categoryRows.length,
      selectedCategory: categorySlug,
      searchQuery,
    };
  }

  const supabase = getSupabasePublicClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("courses_cache")
    .select(LISTING_SELECT, { count: "exact" })
    .eq("published", true)
    .eq("visibility", "public")
    .not("course_slug", "is", null)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (categoryName) {
    query = query.eq("category", categoryName);
  }

  if (searchQuery) {
    const escaped = escapeIlike(searchQuery);
    query = query.or(
      `title.ilike.%${escaped}%,description_md.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[courses-cache-catalog] listing fetch failed:", error.message);
    return {
      courses: [],
      categories,
      pagination: {
        page,
        totalPages: 0,
        total: 0,
        perPage,
      },
      totalPublished: categoryRows.length,
      selectedCategory: categorySlug,
      searchQuery,
    };
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / perPage) : 0;
  const courses = (data ?? [])
    .map((row) => mapRow(row as Record<string, unknown>))
    .filter((course): course is CatalogCourseItem => course !== null);

  await enrichCatalogCoverImages(courses);

  return {
    courses,
    categories,
    pagination: {
      page,
      totalPages,
      total,
      perPage,
    },
    totalPublished: categoryRows.length,
    selectedCategory: categorySlug,
    searchQuery,
  };
}

export async function getCoursesCacheListingPage(params: {
  page?: number;
  categorySlug?: string;
  search?: string;
}): Promise<CoursesCacheListingPage> {
  const page = params.page ?? 1;
  const categorySlug = params.categorySlug
    ? canonicalizeCategorySlug(params.categorySlug)
    : "all";
  const search = params.search?.trim() ?? "";

  return unstable_cache(
    () => buildCoursesCacheListingPage(params),
    ["courses-cache-listing-v3", categorySlug, String(page), search],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["courses-cache-catalog"],
    },
  )();
}
