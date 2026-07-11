import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { fetchAllWpCourseCategories } from "@/lib/tutor/instructor-api";
import {
  fromCoursesCacheLanguageLabel,
  normalizeCoursesCacheWritePayload,
} from "@/lib/instructor/courses-cache-write";
import { fromCoursesCacheSubtitleLanguageLabel } from "@/lib/course/course-language";
import { syncCourseToWp } from "@/lib/wordpress/sync-course-to-wp";

export type CatalogPublishedFilter = "all" | "published" | "unpublished";

export interface AdminCatalogInstructor {
  wpUserId: number;
  fullName: string | null;
  email: string | null;
}

export interface AdminCatalogCourse {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  published: boolean;
  visibility: string;
  wpCourseId: number | null;
  instructorWpUserId: number | null;
  instructorName: string | null;
  instructorEmail: string | null;
  updatedAt: string;
  hasEnglishContent: boolean;
}

export interface AdminCatalogSectionContent {
  id: string;
  title: string;
  titleEn: string | null;
  sortOrder: number;
}

export interface AdminCatalogLessonContent {
  id: string;
  sectionId: string | null;
  title: string;
  titleEn: string | null;
  sortOrder: number;
}

export interface AdminCatalogCourseContent {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  descriptionMd: string | null;
  titleEn: string | null;
  subtitleEn: string | null;
  descriptionMdEn: string | null;
  whatWillLearn: string | null;
  targetAudience: string | null;
  whatWillLearnEn: string | null;
  targetAudienceEn: string | null;
  language: string;
  subtitleLanguage: string | null;
  sections: AdminCatalogSectionContent[];
  lessons: AdminCatalogLessonContent[];
}

export interface AdminCatalogCourseContentInput {
  title: string;
  subtitle?: string | null;
  descriptionMd?: string | null;
  titleEn?: string | null;
  subtitleEn?: string | null;
  descriptionMdEn?: string | null;
  whatWillLearn?: string | null;
  targetAudience?: string | null;
  whatWillLearnEn?: string | null;
  targetAudienceEn?: string | null;
  language?: string | null;
  subtitleLanguage?: string | null;
  sections?: Array<{ id: string; title: string; titleEn?: string | null }>;
  lessons?: Array<{ id: string; title: string; titleEn?: string | null }>;
}

export interface SetAdminCatalogCourseInstructorResult {
  course: AdminCatalogCourse;
  wpSynced: boolean;
  wpWarning?: string;
}

export type SetAdminCatalogCourseCategoryResult = SetAdminCatalogCourseInstructorResult;

const CATALOG_LIST_SELECT =
  "id, course_slug, title, title_en, description_md_en, category, published, visibility, wp_course_id, instructor_wp_user_id, updated_at";

const CATALOG_CONTENT_SELECT =
  "id, course_slug, title, subtitle, description_md, title_en, subtitle_en, description_md_en, what_will_learn, target_audience, what_will_learn_en, target_audience_en, language, subtitle_language";

const CATALOG_WP_SYNC_SELECT =
  "id, course_slug, title, subtitle, description_md, cover_image_url, category, published, visibility, wp_course_id, instructor_wp_user_id, pricing_model, price, sale_price, seo_title, seo_description, seo_focus_keyword";

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

function mapRow(
  row: Record<string, unknown>,
  instructorByWpId: Map<number, AdminCatalogInstructor>,
): AdminCatalogCourse | null {
  const slug = (row.course_slug as string | null)?.trim();
  if (!slug) {
    return null;
  }

  const instructorWpUserId = Number(row.instructor_wp_user_id ?? 0);
  const instructor =
    instructorWpUserId > 0 ? instructorByWpId.get(instructorWpUserId) : undefined;

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
    instructorWpUserId: instructorWpUserId > 0 ? instructorWpUserId : null,
    instructorName: instructor?.fullName ?? null,
    instructorEmail: instructor?.email ?? null,
    updatedAt: String(row.updated_at ?? ""),
    hasEnglishContent: Boolean(
      (row.title_en as string | null)?.trim() ||
        (row.description_md_en as string | null)?.trim(),
    ),
  };
}

async function loadInstructorLookup(): Promise<Map<number, AdminCatalogInstructor>> {
  const instructors = await listAdminCatalogInstructors();
  return new Map(instructors.map((instructor) => [instructor.wpUserId, instructor]));
}

function mapInstructorRow(row: Record<string, unknown>): AdminCatalogInstructor {
  return {
    wpUserId: Number(row.wp_user_id),
    fullName: (row.full_name as string | null)?.trim() || null,
    email: (row.email as string | null)?.trim() || null,
  };
}

function escapeIlike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

export async function listAdminCatalogCategories(): Promise<string[]> {
  const admin = getSupabaseAdmin();
  const [cacheResult, wpCategories] = await Promise.all([
    admin
      .from("courses_cache")
      .select("category")
      .not("category", "is", null)
      .order("category"),
    fetchAllWpCourseCategories(),
  ]);

  if (cacheResult.error) {
    throw new Error(cacheResult.error.message);
  }

  const categories = new Set<string>();
  for (const row of cacheResult.data ?? []) {
    const name = (row.category as string | null)?.trim();
    if (name) {
      categories.add(name);
    }
  }

  for (const category of wpCategories) {
    const name = category.name?.trim();
    if (name) {
      categories.add(name);
    }
  }

  return Array.from(categories).sort((a, b) => a.localeCompare(b, "tr"));
}

async function syncCatalogCourseToWp(
  courseId: string,
  existing: Record<string, unknown>,
  instructor: AdminCatalogInstructor | null,
  overrides?: {
    category?: string | null;
    instructorWpUserId?: number;
  },
): Promise<{ wpSynced: boolean; wpWarning?: string }> {
  const wpCourseId =
    existing.wp_course_id == null || existing.wp_course_id === ""
      ? null
      : Number(existing.wp_course_id);

  if (!wpCourseId || wpCourseId <= 0) {
    return { wpSynced: false };
  }

  const slug = String(existing.course_slug ?? "").trim();
  const instructorWpUserId =
    overrides?.instructorWpUserId ?? Number(existing.instructor_wp_user_id ?? 0);
  const category =
    overrides && "category" in overrides
      ? overrides.category?.trim() || null
      : (existing.category as string | null)?.trim() || null;
  const pricingModel = existing.pricing_model === "paid" ? "paid" : "free";

  const syncResult = await syncCourseToWp({
    academyCourseId: courseId,
    title: String(existing.title ?? "Kurs"),
    slug,
    subtitle: (existing.subtitle as string | null) ?? null,
    description: (existing.description_md as string | null) ?? null,
    coverImageUrl: (existing.cover_image_url as string | null) ?? null,
    category,
    price: pricingModel === "paid" ? Number(existing.price ?? 0) : 0,
    salePrice: existing.sale_price == null ? null : Number(existing.sale_price),
    instructorWpUserId,
    instructorName: instructor?.fullName ?? null,
    instructorEmail: instructor?.email ?? null,
    seoTitle: (existing.seo_title as string | null) ?? null,
    seoDescription: (existing.seo_description as string | null) ?? null,
    seoFocusKeyword: (existing.seo_focus_keyword as string | null) ?? null,
    published: Boolean(existing.published),
    wpCourseId,
  });

  if (syncResult.success) {
    return { wpSynced: true };
  }

  if (syncResult.skipped) {
    return {
      wpSynced: false,
      wpWarning: syncResult.error ?? "WordPress senkronizasyonu yapılandırılmamış.",
    };
  }

  return {
    wpSynced: false,
    wpWarning: syncResult.error ?? "WordPress senkronizasyonu başarısız.",
  };
}

export async function listAdminCatalogInstructors(): Promise<AdminCatalogInstructor[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("instructors")
    .select("wp_user_id, full_name, email")
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .map((row) => mapInstructorRow(row as Record<string, unknown>))
    .filter((instructor) => instructor.wpUserId > 0);
}

export async function listAdminCatalogCourses(
  options: ListAdminCatalogCoursesOptions = {},
): Promise<ListAdminCatalogCoursesResult> {
  const admin = getSupabaseAdmin();
  const page = Math.max(1, options.page ?? 1);
  const perPage = Math.min(100, Math.max(1, options.perPage ?? DEFAULT_PER_PAGE));
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  const instructorByWpId = await loadInstructorLookup();

  let query = admin
    .from("courses_cache")
    .select(CATALOG_LIST_SELECT, { count: "exact" })
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
    .map((row) => mapRow(row as Record<string, unknown>, instructorByWpId))
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

  const instructorByWpId = await loadInstructorLookup();

  const { data: existing, error: lookupError } = await admin
    .from("courses_cache")
    .select(CATALOG_LIST_SELECT)
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
    .select(CATALOG_LIST_SELECT)
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

  const mapped = mapRow(data as Record<string, unknown>, instructorByWpId);
  if (!mapped) {
    throw new Error("Kurs güncellenemedi.");
  }

  return mapped;
}

export async function setAdminCatalogCourseInstructor(
  courseId: string,
  instructorWpUserId: number,
): Promise<SetAdminCatalogCourseInstructorResult> {
  if (!Number.isFinite(instructorWpUserId) || instructorWpUserId <= 0) {
    throw new Error("Geçerli bir yazar seçin.");
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const instructorByWpId = await loadInstructorLookup();
  const instructor = instructorByWpId.get(instructorWpUserId);

  if (!instructor) {
    throw new Error("Seçilen yazar kayıtlı eğitmenler arasında bulunamadı.");
  }

  const { data: existing, error: lookupError } = await admin
    .from("courses_cache")
    .select(CATALOG_WP_SYNC_SELECT)
    .eq("id", courseId)
    .maybeSingle();

  if (lookupError || !existing) {
    throw new Error(lookupError?.message ?? "Kurs bulunamadı.");
  }

  const slug = String(existing.course_slug ?? "").trim();
  if (!slug) {
    throw new Error("Kurs slug bilgisi eksik.");
  }

  const currentInstructorId = Number(existing.instructor_wp_user_id ?? 0);
  if (currentInstructorId === instructorWpUserId) {
    const mapped = mapRow(existing as Record<string, unknown>, instructorByWpId);
    if (!mapped) {
      throw new Error("Kurs güncellenemedi.");
    }
    return { course: mapped, wpSynced: true };
  }

  const { data, error } = await admin
    .from("courses_cache")
    .update({
      instructor_wp_user_id: instructorWpUserId,
      updated_at: now,
    })
    .eq("id", courseId)
    .select(CATALOG_LIST_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kurs yazarı güncellenemedi.");
  }

  const wpCourseId =
    existing.wp_course_id == null || existing.wp_course_id === ""
      ? null
      : Number(existing.wp_course_id);

  if (wpCourseId && wpCourseId > 0) {
    const { error: statsError } = await admin
      .from("instructor_course_stats")
      .upsert(
        {
          wp_course_id: wpCourseId,
          course_slug: slug,
          instructor_wp_user_id: instructorWpUserId,
          title: String(existing.title ?? "Kurs"),
          image_url: (existing.cover_image_url as string | null)?.trim() || null,
          status: existing.published ? "publish" : "draft",
          synced_at: now,
        },
        { onConflict: "wp_course_id" },
      );

    if (statsError) {
      throw new Error(`Eğitmen paneli kaydı güncellenemedi: ${statsError.message}`);
    }
  }

  const mapped = mapRow(data as Record<string, unknown>, instructorByWpId);
  if (!mapped) {
    throw new Error("Kurs güncellenemedi.");
  }

  const { wpSynced, wpWarning } = await syncCatalogCourseToWp(
    courseId,
    existing as Record<string, unknown>,
    instructor,
    { instructorWpUserId },
  );

  return { course: mapped, wpSynced, wpWarning };
}

export async function setAdminCatalogCourseCategory(
  courseId: string,
  category: string,
): Promise<SetAdminCatalogCourseCategoryResult> {
  const nextCategory = category.trim();
  if (!nextCategory) {
    throw new Error("Geçerli bir kategori seçin.");
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();
  const instructorByWpId = await loadInstructorLookup();

  const { data: existing, error: lookupError } = await admin
    .from("courses_cache")
    .select(CATALOG_WP_SYNC_SELECT)
    .eq("id", courseId)
    .maybeSingle();

  if (lookupError || !existing) {
    throw new Error(lookupError?.message ?? "Kurs bulunamadı.");
  }

  const currentCategory = (existing.category as string | null)?.trim() || null;
  if (currentCategory === nextCategory) {
    const mapped = mapRow(existing as Record<string, unknown>, instructorByWpId);
    if (!mapped) {
      throw new Error("Kurs güncellenemedi.");
    }
    return { course: mapped, wpSynced: true };
  }

  const { data, error } = await admin
    .from("courses_cache")
    .update({
      category: nextCategory,
      updated_at: now,
    })
    .eq("id", courseId)
    .select(CATALOG_LIST_SELECT)
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? "Kurs kategorisi güncellenemedi.");
  }

  const mapped = mapRow(data as Record<string, unknown>, instructorByWpId);
  if (!mapped) {
    throw new Error("Kurs güncellenemedi.");
  }

  const instructorWpUserId = Number(existing.instructor_wp_user_id ?? 0);
  const instructor =
    instructorWpUserId > 0 ? instructorByWpId.get(instructorWpUserId) ?? null : null;

  const { wpSynced, wpWarning } = await syncCatalogCourseToWp(
    courseId,
    { ...(existing as Record<string, unknown>), category: nextCategory },
    instructor,
    { category: nextCategory },
  );

  return { course: mapped, wpSynced, wpWarning };
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

export async function getAdminCatalogCourseContent(
  courseId: string,
): Promise<AdminCatalogCourseContent> {
  const admin = getSupabaseAdmin();

  const { data: row, error } = await admin
    .from("courses_cache")
    .select(CATALOG_CONTENT_SELECT)
    .eq("id", courseId)
    .maybeSingle();

  if (error || !row) {
    throw new Error(error?.message ?? "Kurs bulunamadı.");
  }

  const slug = String(row.course_slug ?? "").trim();
  if (!slug) {
    throw new Error("Kurs slug bilgisi eksik.");
  }

  const [{ data: sections }, { data: lessons }] = await Promise.all([
    admin
      .from("sections")
      .select("id, title, title_en, sort_order")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true }),
    admin
      .from("lessons")
      .select("id, section_id, title, title_en, sort_order")
      .eq("courses_cache_id", courseId)
      .order("sort_order", { ascending: true }),
  ]);

  const subtitleLanguageLabel = fromCoursesCacheSubtitleLanguageLabel(
    row.subtitle_language as string | null | undefined,
  );

  return {
    id: courseId,
    slug,
    title: String(row.title ?? "Kurs"),
    subtitle: (row.subtitle as string | null)?.trim() || null,
    descriptionMd: (row.description_md as string | null) ?? null,
    titleEn: (row.title_en as string | null)?.trim() || null,
    subtitleEn: (row.subtitle_en as string | null)?.trim() || null,
    descriptionMdEn: (row.description_md_en as string | null) ?? null,
    whatWillLearn: (row.what_will_learn as string | null) ?? null,
    targetAudience: (row.target_audience as string | null) ?? null,
    whatWillLearnEn: (row.what_will_learn_en as string | null) ?? null,
    targetAudienceEn: (row.target_audience_en as string | null) ?? null,
    language: fromCoursesCacheLanguageLabel(row.language as string | null | undefined),
    subtitleLanguage:
      subtitleLanguageLabel === "Yok" ? null : subtitleLanguageLabel,
    sections: (sections ?? []).map((section) => ({
      id: String(section.id),
      title: String(section.title ?? ""),
      titleEn: (section.title_en as string | null)?.trim() || null,
      sortOrder: Number(section.sort_order ?? 0),
    })),
    lessons: (lessons ?? []).map((lesson) => ({
      id: String(lesson.id),
      sectionId: lesson.section_id ? String(lesson.section_id) : null,
      title: String(lesson.title ?? ""),
      titleEn: (lesson.title_en as string | null)?.trim() || null,
      sortOrder: Number(lesson.sort_order ?? 0),
    })),
  };
}

export async function updateAdminCatalogCourseContent(
  courseId: string,
  input: AdminCatalogCourseContentInput,
): Promise<AdminCatalogCourseContent> {
  const title = input.title?.trim();
  if (!title) {
    throw new Error("Kurs başlığı zorunludur.");
  }

  const admin = getSupabaseAdmin();
  const now = new Date().toISOString();

  const cachePayload = normalizeCoursesCacheWritePayload({
    title,
    subtitle: input.subtitle?.trim() || null,
    description_md: input.descriptionMd ?? null,
    title_en: input.titleEn?.trim() || null,
    subtitle_en: input.subtitleEn?.trim() || null,
    description_md_en: input.descriptionMdEn ?? null,
    what_will_learn: input.whatWillLearn ?? null,
    target_audience: input.targetAudience ?? null,
    what_will_learn_en: input.whatWillLearnEn ?? null,
    target_audience_en: input.targetAudienceEn ?? null,
    language: input.language ?? "Türkçe",
    subtitle_language: input.subtitleLanguage ?? null,
    updated_at: now,
  });

  const { error: courseError } = await admin
    .from("courses_cache")
    .update(cachePayload)
    .eq("id", courseId);

  if (courseError) {
    throw new Error(courseError.message);
  }

  const sectionUpdates = input.sections ?? [];
  for (const section of sectionUpdates) {
    const sectionTitle = section.title?.trim();
    if (!sectionTitle) continue;

    const { error: sectionError } = await admin
      .from("sections")
      .update({
        title: sectionTitle,
        title_en: section.titleEn?.trim() || null,
      })
      .eq("id", section.id)
      .eq("course_id", courseId);

    if (sectionError) {
      throw new Error(`Bölüm güncellenemedi: ${sectionError.message}`);
    }
  }

  const lessonUpdates = input.lessons ?? [];
  for (const lesson of lessonUpdates) {
    const lessonTitle = lesson.title?.trim();
    if (!lessonTitle) continue;

    const { error: lessonError } = await admin
      .from("lessons")
      .update({
        title: lessonTitle,
        title_en: lesson.titleEn?.trim() || null,
      })
      .eq("id", lesson.id)
      .eq("courses_cache_id", courseId);

    if (lessonError) {
      throw new Error(`Ders güncellenemedi: ${lessonError.message}`);
    }
  }

  return getAdminCatalogCourseContent(courseId);
}
