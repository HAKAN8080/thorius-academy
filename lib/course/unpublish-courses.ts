import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface UnpublishCoursesFilter {
  slugs?: string[];
  slugPrefix?: string;
  categoryIncludes?: string;
}

export interface UnpublishCoursePreview {
  id: string;
  slug: string;
  title: string;
  wpCourseId: number | null;
  published: boolean;
}

export interface UnpublishCoursesResult {
  matched: UnpublishCoursePreview[];
  unpublished: number;
  productsDeactivated: number;
  dryRun: boolean;
}

function normalizeSlugList(slugs: string[]): string[] {
  return [...new Set(slugs.map((slug) => slug.trim()).filter(Boolean))];
}

export async function listCoursesForUnpublish(
  filter: UnpublishCoursesFilter,
): Promise<UnpublishCoursePreview[]> {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("courses_cache")
    .select("id, course_slug, title, wp_course_id, published")
    .order("title");

  if (filter.categoryIncludes?.trim()) {
    query = query.ilike("category", `%${filter.categoryIncludes.trim()}%`);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  let rows = (data ?? []).map((row) => ({
    id: String(row.id),
    slug: String(row.course_slug ?? ""),
    title: String(row.title ?? ""),
    wpCourseId:
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    published: Boolean(row.published),
  }));

  if (filter.slugs?.length) {
    const targets = new Set(normalizeSlugList(filter.slugs));
    rows = rows.filter((row) => targets.has(row.slug));
  }

  if (filter.slugPrefix?.trim()) {
    const prefix = filter.slugPrefix.trim().toLowerCase();
    rows = rows.filter((row) => row.slug.toLowerCase().startsWith(prefix));
  }

  return rows.filter((row) => row.slug);
}

export async function unpublishCourses(
  filter: UnpublishCoursesFilter,
  options: { dryRun?: boolean } = {},
): Promise<UnpublishCoursesResult> {
  const dryRun = options.dryRun ?? false;
  const matched = await listCoursesForUnpublish(filter);

  if (matched.length === 0 || dryRun) {
    return {
      matched,
      unpublished: 0,
      productsDeactivated: 0,
      dryRun,
    };
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const ids = matched.map((course) => course.id);
  const wpIds = matched
    .map((course) => course.wpCourseId)
    .filter((id): id is number => typeof id === "number" && id > 0);

  const { error: cacheError } = await admin
    .from("courses_cache")
    .update({
      published: false,
      visibility: "private",
      updated_at: now,
    })
    .in("id", ids);

  if (cacheError) {
    throw new Error(`courses_cache güncellenemedi: ${cacheError.message}`);
  }

  let productsDeactivated = 0;
  if (wpIds.length > 0) {
    const { data: products, error: productLookupError } = await admin
      .from("course_products")
      .select("id")
      .in("wp_course_id", wpIds)
      .eq("is_active", true);

    if (productLookupError) {
      throw new Error(
        `course_products okunamadı: ${productLookupError.message}`,
      );
    }

    const productIds = (products ?? []).map((row) => String(row.id));
    if (productIds.length > 0) {
      const { error: productError } = await admin
        .from("course_products")
        .update({ is_active: false })
        .in("id", productIds);

      if (productError) {
        throw new Error(
          `course_products güncellenemedi: ${productError.message}`,
        );
      }

      productsDeactivated = productIds.length;
    }
  }

  return {
    matched,
    unpublished: matched.length,
    productsDeactivated,
    dryRun: false,
  };
}
