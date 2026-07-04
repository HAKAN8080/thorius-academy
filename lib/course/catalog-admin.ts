import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CatalogPublishedFilter = "all" | "published" | "unpublished";

export interface AdminCatalogCourse {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published: boolean;
  visibility: string;
  wpCourseId: number | null;
  updatedAt: string;
}

export interface ListAdminCatalogCoursesOptions {
  search?: string;
  category?: string;
  published?: CatalogPublishedFilter;
  page?: number;
  perPage?: number;
}

export interface ListAdminCatalogCoursesResult {
  courses: AdminCatalogCourse[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  categories: string[];
}

const DEFAULT_PER_PAGE = 30;

function mapRow(row: Record<string, unknown>): AdminCatalogCourse | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  return {
    id: String(row.id),
    slug,
    title: String(row.title ?? "Kurs"),
    category: (row.category as string | null)?.trim() || null,
    published: Boolean(row.published),
    visibility: String(row.visibility ?? "public"),
    wpCourseId:
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    updatedAt: String(row.updated_at ?? ""),
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function listAdminCatalogCategories(): Promise<string[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("courses_cache")
    .select("category")
    .not("category", "is", null)
    .order("category");

  if (error) {
    throw new Error(error.message);
  }

  const categories = new Set<string>();
  for (const row of data ?? []) {
    const name = (row.category as string | null)?.trim();
    if (name) {
      categories.add(name);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b, "tr"));
}

export async function listAdminCatalogCourses(
  options: ListAdminCatalogCoursesOptions = {},
): Promise<ListAdminCatalogCoursesResult> {
  const admin = getSupabaseAdmin();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? DEFAULT_PER_PAGE));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = admin
    .from("courses_cache")
    .select(
      "id, course_slug, title, category, published, visibility, wp_course_id, updated_at",
      { count: "exact" },
    )
    .not("course_slug", "is", null);

  const search = options.search?.trim();
  if (search) {
    const escaped = escapeIlike(search);
    query = query.or(
      `title.ilike.%${escaped}%,course_slug.ilike.%${escaped}%`,
    );
  }

  if (options.category?.trim()) {
    query = query.eq("category", options.category.trim());
  }

  if (options.published === "published") {
    query = query.eq("published", true);
  } else if (options.published === "unpublished") {
    query = query.eq("published", false);
  }

  const { data, error, count } = await query
    .order("title", { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const courses = (data ?? [])
    .map((row) => mapRow(row as Record<string, unknown>))
    .filter((course): course is AdminCatalogCourse => course !== null);

  const total = count ?? courses.length;
  const categories = await listAdminCatalogCategories();

  return {
    courses,
    total,
    page,
    perPage,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
    categories,
  };
}

export async function setAdminCatalogCoursePublished(
  courseId: string,
  published: boolean,
): Promise<AdminCatalogCourse> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const { data: existing, error: lookupError } = await admin
    .from("courses_cache")
    .select(
      "id, course_slug, title, category, published, visibility, wp_course_id, updated_at",
    )
    .eq("id", courseId)
    .maybeSingle();

  if (lookupError || !existing) {
    throw new Error(lookupError?.message ?? "Kurs bulunamadı.");
  }

  const { data, error } = await admin
    .from("courses_cache")
    .update({
      published,
      visibility: published ? "public" : "private",
      updated_at: now,
    })
    .eq("id", courseId)
    .select(
      "id, course_slug, title, category, published, visibility, wp_course_id, updated_at",
    )
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kurs güncellenemedi.");
  }

  const wpCourseId =
    data.wp_course_id == null || data.wp_course_id === ""
      ? null
      : Number(data.wp_course_id);

  if (wpCourseId && wpCourseId > 0) {
    const { error: productError } = await admin
      .from("course_products")
      .update({ is_active: published })
      .eq("wp_course_id", wpCourseId);

    if (productError) {
      throw new Error(`Ürün durumu güncellenemedi: ${productError.message}`);
    }
  }

  const mapped = mapRow(data as Record<string, unknown>);
  if (!mapped) {
    throw new Error("Kurs güncellenemedi.");
  }

  return mapped;
}

export async function bulkSetAdminCatalogCoursesPublished(
  options: ListAdminCatalogCoursesOptions,
  published: boolean,
): Promise<{ updated: number; slugs: string[] }> {
  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  let query = admin
    .from("courses_cache")
    .select("id, course_slug, wp_course_id")
    .not("course_slug", "is", null);

  const search = options.search?.trim();
  if (search) {
    const escaped = escapeIlike(search);
    query = query.or(
      `title.ilike.%${escaped}%,course_slug.ilike.%${escaped}%`,
    );
  }

  if (options.category?.trim()) {
    query = query.eq("category", options.category.trim());
  }

  if (options.published === "published") {
    query = query.eq("published", true);
  } else if (options.published === "unpublished") {
    query = query.eq("published", false);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return { updated: 0, slugs: [] };
  }

  const ids = rows.map((row) => String(row.id));
  const wpIds = rows
    .map((row) =>
      row.wp_course_id == null || row.wp_course_id === ""
        ? null
        : Number(row.wp_course_id),
    )
    .filter((id): id is number => typeof id === "number" && id > 0);

  const { error: cacheError } = await admin
    .from("courses_cache")
    .update({
      published,
      visibility: published ? "public" : "private",
      updated_at: now,
    })
    .in("id", ids);

  if (cacheError) {
    throw new Error(`courses_cache güncellenemedi: ${cacheError.message}`);
  }

  if (wpIds.length > 0) {
    const { error: productError } = await admin
      .from("course_products")
      .update({ is_active: published })
      .in("wp_course_id", wpIds);

    if (productError) {
      throw new Error(`course_products güncellenemedi: ${productError.message}`);
    }
  }

  return {
    updated: rows.length,
    slugs: rows
      .map((row) => String(row.course_slug ?? ""))
      .filter(Boolean),
  };
}
