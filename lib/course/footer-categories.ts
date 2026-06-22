import { unstable_cache } from "next/cache";
import {
  buildCategories,
} from "@/lib/course/courses-cache-catalog";
import { canonicalizeCategorySlug, slugifyCategoryName } from "@/lib/course/category-slug";
import { getSupabasePublicClient } from "@/lib/supabase/public";
import { COURSE_CATEGORY_CACHE_TAG } from "@/lib/wordpress/cache-tags";
import type { WPCategory } from "@/types/wordpress";

const REVALIDATE_SECONDS = 3600;

function stableNumericId(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) || 1;
}

async function buildFooterCategories(): Promise<WPCategory[]> {
  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("courses_cache")
    .select("category,cover_image_url,course_slug")
    .eq("published", true)
    .eq("visibility", "public")
    .not("course_slug", "is", null);

  if (error) {
    console.error("[footer-categories] fetch failed:", error.message);
    return [];
  }

  const rows = (data ?? []) as Array<{
    category: string | null;
    cover_image_url: string | null;
    course_slug: string | null;
  }>;

  const catalogCategories = buildCategories(
    rows.map((row) => ({ category: row.category })),
  );

  const coversByCategorySlug = new Map<string, Array<string | null>>();
  for (const row of rows) {
    const name = row.category?.trim();
    if (!name) {
      continue;
    }
    const slug = slugifyCategoryName(name);
    const list = coversByCategorySlug.get(slug) ?? [];
    list.push(row.cover_image_url);
    coversByCategorySlug.set(slug, list);
  }

  return catalogCategories.map((category) => {
    const canonical = canonicalizeCategorySlug(category.slug);
    const covers =
      coversByCategorySlug.get(category.slug) ??
      coversByCategorySlug.get(canonical) ??
      [];

    const image = covers.find((cover) => cover?.trim()) ?? null;

    return {
      id: stableNumericId(category.slug),
      name: category.name,
      slug: category.slug,
      description: "",
      count: category.count,
      taxonomy: "course-category",
      image,
    };
  });
}

export async function getFooterCategoriesFromCache(): Promise<WPCategory[]> {
  return unstable_cache(buildFooterCategories, ["footer-categories-v1"], {
    revalidate: REVALIDATE_SECONDS,
    tags: [COURSE_CATEGORY_CACHE_TAG, "courses-cache-catalog"],
  })();
}
