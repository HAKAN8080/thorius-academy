import { unstable_cache } from "next/cache";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import { FREE_HUB_COLUMNS } from "@/lib/content/homepage-free-hub";
import { fromCoursesCacheLevelLabel } from "@/lib/instructor/courses-cache-write";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabasePublicClient } from "@/lib/supabase/public";

const REVALIDATE_SECONDS = 3600;

const ROW_SELECT =
  "course_slug,title,cover_image_url,level,pricing_model,price,sale_price,instructor_wp_user_id,category";

export interface FreeHubCourseItem {
  slug: string;
  title: string;
  coverImageUrl: string | null;
  instructorName: string | null;
  level: string;
  href: string;
}

export interface FreeHubColumn {
  id: string;
  title: string;
  viewAllHref: string;
  accentClass: string;
  courses: FreeHubCourseItem[];
}

function configuredFreeSlugs(): string[] {
  const raw = process.env.HOMEPAGE_FREE_COURSE_SLUGS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}

function isFreeRow(row: Record<string, unknown>): boolean {
  const pricingModel = row.pricing_model === "paid" ? "paid" : "free";
  const price = Number(row.price ?? 0);
  const salePrice =
    row.sale_price == null || row.sale_price === ""
      ? null
      : Number(row.sale_price);

  return (
    pricingModel === "free" ||
    price <= 0 ||
    (salePrice != null && salePrice <= 0)
  );
}

async function fetchInstructorNames(
  instructorIds: number[],
): Promise<Map<number, string>> {
  const map = new Map<number, string>();
  if (instructorIds.length === 0) {
    return map;
  }

  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from("instructors")
      .select("wp_user_id, full_name")
      .in("wp_user_id", instructorIds);

    for (const row of data ?? []) {
      const name = (row.full_name as string | null)?.trim();
      if (name) {
        map.set(Number(row.wp_user_id), name);
      }
    }
  } catch (error) {
    console.error("[homepage-free-hub] instructor fetch failed:", error);
  }

  return map;
}

function mapRowToItem(
  row: Record<string, unknown>,
  instructors: Map<number, string>,
): FreeHubCourseItem | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  const instructorId = Number(row.instructor_wp_user_id ?? 0);

  return {
    slug,
    title: (row.title as string) || "Kurs",
    coverImageUrl: (row.cover_image_url as string | null) ?? null,
    instructorName:
      instructorId > 0 ? instructors.get(instructorId) ?? null : null,
    level: fromCoursesCacheLevelLabel(row.level as string | null | undefined),
    href: `/kurslar/${slug}`,
  };
}

async function fetchRowsBySlugs(
  slugs: string[],
): Promise<Map<string, Record<string, unknown>>> {
  if (slugs.length === 0) {
    return new Map();
  }

  const supabase = getSupabasePublicClient();
  const { data, error } = await supabase
    .from("courses_cache")
    .select(ROW_SELECT)
    .eq("published", true)
    .eq("visibility", "public")
    .in("course_slug", slugs);

  if (error) {
    console.error("[homepage-free-hub] slug fetch failed:", error.message);
    return new Map();
  }

  return new Map(
    (data ?? []).map((row) => [
      (row.course_slug as string).trim(),
      row as Record<string, unknown>,
    ]),
  );
}

async function fetchFreeRowsForColumn(
  categoryMatches: readonly string[],
  limit = 3,
): Promise<Record<string, unknown>[]> {
  const supabase = getSupabasePublicClient();
  const seen = new Set<string>();
  const results: Record<string, unknown>[] = [];

  for (const label of categoryMatches) {
    if (results.length >= limit) {
      break;
    }

    const { data, error } = await supabase
      .from("courses_cache")
      .select(ROW_SELECT)
      .eq("published", true)
      .eq("visibility", "public")
      .ilike("category", `%${label}%`)
      .order("updated_at", { ascending: false })
      .limit(limit * 4);

    if (error) {
      console.error("[homepage-free-hub] category fetch failed:", error.message);
      continue;
    }

    for (const row of data ?? []) {
      const slug = (row.course_slug as string | null)?.trim();
      if (!slug || seen.has(slug)) {
        continue;
      }
      if (!isFreeRow(row as Record<string, unknown>)) {
        continue;
      }

      seen.add(slug);
      results.push(row as Record<string, unknown>);
      if (results.length >= limit) {
        break;
      }
    }
  }

  return results;
}

function matchesColumnCategory(
  category: string,
  column: (typeof FREE_HUB_COLUMNS)[number],
): boolean {
  const normalized = category.toLocaleLowerCase("tr-TR");

  return column.categoryMatches.some((label) =>
    normalized.includes(label.toLocaleLowerCase("tr-TR")),
  );
}

function resolveColumnIndex(
  row: Record<string, unknown>,
  columnRows: Record<string, unknown>[][],
): number {
  const category = ((row.category as string) ?? "").toLocaleLowerCase("tr-TR");

  for (let index = 0; index < FREE_HUB_COLUMNS.length; index += 1) {
    if (matchesColumnCategory(category, FREE_HUB_COLUMNS[index])) {
      return index;
    }
  }

  let shortestIndex = 0;
  for (let index = 1; index < columnRows.length; index += 1) {
    if (columnRows[index].length < columnRows[shortestIndex].length) {
      shortestIndex = index;
    }
  }

  return shortestIndex;
}

async function buildFreeHubColumns(): Promise<FreeHubColumn[]> {
  const pinnedSlugs = configuredFreeSlugs();
  const pinnedRows = await fetchRowsBySlugs(pinnedSlugs);
  const columnRows: Record<string, unknown>[][] = FREE_HUB_COLUMNS.map(() => []);

  if (pinnedSlugs.length > 0) {
    for (let index = 0; index < pinnedSlugs.length; index += 1) {
      const slug = pinnedSlugs[index]?.trim();
      if (!slug) {
        continue;
      }

      const row = pinnedRows.get(slug);
      if (!row) {
        continue;
      }

      const columnIndex =
        index < FREE_HUB_COLUMNS.length
          ? index
          : resolveColumnIndex(row, columnRows);
      columnRows[columnIndex].push(row);
    }
  }

  for (let index = 0; index < FREE_HUB_COLUMNS.length; index += 1) {
    if (columnRows[index].length > 0) {
      continue;
    }

    columnRows[index].push(
      ...(await fetchFreeRowsForColumn(FREE_HUB_COLUMNS[index].categoryMatches, 3)),
    );
  }

  const instructorIds = Array.from(
    new Set(
      columnRows
        .flat()
        .map((row) => Number(row.instructor_wp_user_id ?? 0))
        .filter((id) => id > 0),
    ),
  );
  const instructors = await fetchInstructorNames(instructorIds);

  return FREE_HUB_COLUMNS.map((column, index) => ({
    id: column.id,
    title: column.title,
    viewAllHref: buildKurslarUrl({ categorySlug: column.categorySlug }),
    accentClass: column.accentClass,
    courses: columnRows[index]
      .map((row) => mapRowToItem(row, instructors))
      .filter((item): item is FreeHubCourseItem => item !== null),
  }));
}

export async function getHomepageFreeHubColumns(): Promise<FreeHubColumn[]> {
  return unstable_cache(
    buildFreeHubColumns,
    [
      "homepage-free-hub-v3",
      process.env.HOMEPAGE_FREE_COURSE_SLUGS ?? "",
    ],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["courses-cache-catalog"],
    },
  )();
}
