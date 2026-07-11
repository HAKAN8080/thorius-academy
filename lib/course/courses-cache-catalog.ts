import { unstable_cache } from "next/cache";
import {
  canonicalizeCategorySlug,
  slugifyCategoryName,
} from "@/lib/course/category-slug";
import {
  resolveCourseLanguageMeta,
  type CourseLanguageCode,
} from "@/lib/course/course-language";
import { pickLocalized } from "@/lib/course/resolve-course-content";
import type { AppLocale } from "@/i18n/routing";
import { resolveCategoryDisplayPriority } from "@/lib/course/sort-homepage-categories";
import { enrichCatalogCoverImages } from "@/lib/course/enrich-catalog-cover-images";
import { enrichCatalogWithCourseProducts } from "@/lib/course/enrich-catalog-with-products";
import {
  fromCoursesCacheLevelLabel,
  toCoursesCacheLanguageDbValue,
} from "@/lib/instructor/courses-cache-write";
import { getSupabasePublicClient } from "@/lib/supabase/public";

export const COURSES_CATALOG_PER_PAGE = 24;

const REVALIDATE_SECONDS = 3600;

const LISTING_SELECT =
  "id,course_slug,wp_course_id,title,title_en,subtitle,description_md,description_md_en,cover_image_url,category,level,language,subtitle_language,pricing_model,price,sale_price,updated_at";

export interface CatalogCourseItem {
  id: string;
  slug: string;
  wpCourseId: number | null;
  title: string;
  description: string;
  coverImageUrl: string | null;
  category: string | null;
  level: string;
  language: "tr" | "en";
  subtitleLanguage: "tr" | "en" | null;
  pricingModel: "free" | "paid";
  price: number;
  salePrice: number | null;
  createdAt?: string | null;
}

export interface CatalogLanguageItem {
  code: CourseLanguageCode;
  count: number;
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
  selectedLanguage?: CourseLanguageCode;
  searchQuery?: string;
  languages: CatalogLanguageItem[];
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

function mapRow(
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

export function buildLanguages(
  rows: Array<{ language: string | null }>,
): CatalogLanguageItem[] {
  const counts = new Map<CourseLanguageCode, number>();

  for (const row of rows) {
    const dbValue = toCoursesCacheLanguageDbValue(row.language);
    const code: CourseLanguageCode = dbValue === "english" ? "en" : "tr";
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  const order: CourseLanguageCode[] = ["tr", "en"];

  return order
    .filter((code) => (counts.get(code) ?? 0) > 0)
    .map((code) => ({
      code,
      count: counts.get(code) ?? 0,
    }));
}

export function buildCategories(rows: Array<{ category: string | null }>): CatalogCategoryItem[] {
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
    .sort((left, right) => {
      const leftPriority = resolveCategoryDisplayPriority({
        slug: left.slug,
        name: left.name,
      });
      const rightPriority = resolveCategoryDisplayPriority({
        slug: right.slug,
        name: right.name,
      });

      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.name.localeCompare(right.name, "tr");
    });
}

function sortCatalogRowsByDisplayPriority(
  rows: Record<string, unknown>[],
): Record<string, unknown>[] {
  return [...rows].sort((left, right) => {
    const leftPriority = resolveCategoryDisplayPriority({
      name: (left.category as string | null) ?? null,
    });
    const rightPriority = resolveCategoryDisplayPriority({
      name: (right.category as string | null) ?? null,
    });

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    const leftUpdated = new Date(String(left.updated_at ?? 0)).getTime();
    const rightUpdated = new Date(String(right.updated_at ?? 0)).getTime();
    return rightUpdated - leftUpdated;
  });
}

function resolveCategoryNamesForSlug(
  sourceRows: Array<{ category: string | null }>,
  categorySlug?: string,
): string[] {
  if (!categorySlug) {
    return [];
  }

  const canonical = canonicalizeCategorySlug(categorySlug);
  const names = new Set<string>();

  for (const row of sourceRows) {
    const name = row.category?.trim();
    if (!name) {
      continue;
    }

    if (canonicalizeCategorySlug(slugifyCategoryName(name)) === canonical) {
      names.add(name);
    }
  }

  return Array.from(names);
}

async function fetchListingSourceRows(): Promise<
  Array<{ category: string | null; language: string | null }>
> {
  return getCachedListingSourceRows();
}

const getCachedListingSourceRows = unstable_cache(
  async () => {
    const supabase = getSupabasePublicClient();
    const { data, error } = await supabase
      .from("courses_cache")
      .select("category,language")
      .eq("published", true)
      .eq("visibility", "public")
      .not("course_slug", "is", null);

    if (error) {
      console.error(
        "[courses-cache-catalog] listing source fetch failed:",
        error.message,
      );
      return [];
    }

    return (data ?? []) as Array<{ category: string | null; language: string | null }>;
  },
  ["courses-cache-listing-source-rows"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: ["courses-cache-catalog"],
  },
);

async function buildCoursesCacheListingPage(params: {
  page?: number;
  categorySlug?: string;
  search?: string;
  language?: CourseLanguageCode;
  locale?: AppLocale;
}): Promise<CoursesCacheListingPage> {
  const page = Math.max(1, params.page ?? 1);
  const perPage = COURSES_CATALOG_PER_PAGE;
  const locale = params.locale ?? "tr";
  const searchQuery = params.search?.trim() || undefined;
  const selectedLanguage = params.language;
  const categorySlug = params.categorySlug
    ? canonicalizeCategorySlug(params.categorySlug)
    : undefined;
  const sourceRows = await fetchListingSourceRows();
  const categories = buildCategories(sourceRows);
  const languages = buildLanguages(sourceRows);
  const categoryNames = resolveCategoryNamesForSlug(sourceRows, categorySlug);

  if (categorySlug && categoryNames.length === 0) {
    return {
      courses: [],
      categories,
      languages,
      pagination: {
        page,
        totalPages: 0,
        total: 0,
        perPage,
      },
      totalPublished: sourceRows.length,
      selectedCategory: categorySlug,
      selectedLanguage,
      searchQuery,
    };
  }

  const supabase = getSupabasePublicClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;
  const useCategoryPrioritySort =
    categoryNames.length === 0 && !searchQuery && !selectedLanguage;

  let query = supabase
    .from("courses_cache")
    .select(LISTING_SELECT, { count: "exact" })
    .eq("published", true)
    .eq("visibility", "public")
    .not("course_slug", "is", null);

  if (useCategoryPrioritySort) {
    query = query.order("updated_at", { ascending: false });
  } else {
    query = query.order("updated_at", { ascending: false }).range(from, to);
  }

  if (categoryNames.length > 0) {
    query = query.in("category", categoryNames);
  }

  if (selectedLanguage) {
    query = query.eq(
      "language",
      toCoursesCacheLanguageDbValue(
        selectedLanguage === "en" ? "İngilizce" : "Türkçe",
      ),
    );
  }

  if (searchQuery) {
    const escaped = escapeIlike(searchQuery);
    query = query.or(
      `title.ilike.%${escaped}%,description_md.ilike.%${escaped}%,title_en.ilike.%${escaped}%,description_md_en.ilike.%${escaped}%`,
    );
  }

  const { data, error, count } = await query;

  if (error) {
    console.error("[courses-cache-catalog] listing fetch failed:", error.message);
    return {
      courses: [],
      categories,
      languages,
      pagination: {
        page,
        totalPages: 0,
        total: 0,
        perPage,
      },
      totalPublished: sourceRows.length,
      selectedCategory: categorySlug,
      selectedLanguage,
      searchQuery,
    };
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / perPage) : 0;
  const rawRows = (data ?? []) as Record<string, unknown>[];
  const pageRows = useCategoryPrioritySort
    ? sortCatalogRowsByDisplayPriority(rawRows).slice(from, to + 1)
    : rawRows;
  const courses = pageRows
    .map((row) => mapRow(row, locale))
    .filter((course): course is CatalogCourseItem => course !== null);

  await enrichCatalogCoverImages(courses);

  return {
    courses,
    categories,
    languages,
    pagination: {
      page,
      totalPages,
      total,
      perPage,
    },
    totalPublished: sourceRows.length,
    selectedCategory: categorySlug,
    selectedLanguage,
    searchQuery,
  };
}

export async function getCoursesCacheListingPage(params: {
  page?: number;
  categorySlug?: string;
  search?: string;
  language?: CourseLanguageCode;
  locale?: AppLocale;
}): Promise<CoursesCacheListingPage> {
  const page = params.page ?? 1;
  const categorySlug = params.categorySlug
    ? canonicalizeCategorySlug(params.categorySlug)
    : "all";
  const search = params.search?.trim() ?? "";
  const language = params.language ?? "all";
  const locale = params.locale ?? "tr";

  const listing = await unstable_cache(
    () => buildCoursesCacheListingPage({ ...params, locale }),
    ["courses-cache-listing-v11", categorySlug, language, String(page), search, locale],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["courses-cache-catalog"],
    },
  )();

  return {
    ...listing,
    courses: await enrichCatalogWithCourseProducts(listing.courses),
  };
}
