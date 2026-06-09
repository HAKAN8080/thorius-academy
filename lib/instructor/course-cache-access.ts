import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getCurriculumAccess,
  requireCurriculumAccess,
} from "@/lib/instructor/curriculum-access";
import type { CoursesCache } from "@/types/instructor-course";

export function normalizeCourseCacheId(
  id: string | number | bigint | null | undefined,
): string {
  if (id == null) {
    return "";
  }
  return String(id);
}

/** Production tablosunda legacy `slug` kolonu da zorunlu olabilir. */
export function buildCoursesCacheSlugFields(slug: string): {
  course_slug: string;
  slug: string;
} {
  const normalized = slug.trim();
  return {
    course_slug: normalized,
    slug: normalized,
  };
}

export function withCoursesCacheSlug<T extends Record<string, unknown>>(
  payload: T,
  slug: string,
): T & { course_slug: string; slug: string } {
  return {
    ...payload,
    ...buildCoursesCacheSlugFields(slug),
  };
}

export function normalizeCoursesCacheRow(
  row: Record<string, unknown>,
): CoursesCache {
  return {
    id: normalizeCourseCacheId(row.id as string | number | bigint),
    wp_course_id:
      typeof row.wp_course_id === "number" ? row.wp_course_id : null,
    instructor_wp_user_id: Number(row.instructor_wp_user_id ?? 0),
    course_slug: (row.course_slug as string | null) ?? null,
    title: (row.title as string) || "Yeni Kurs",
    subtitle: (row.subtitle as string | null) ?? null,
    description_md: (row.description_md as string | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    intro_video_url: (row.intro_video_url as string | null) ?? null,
    pricing_model:
      row.pricing_model === "paid" ? "paid" : ("free" as CoursesCache["pricing_model"]),
    price: Number(row.price ?? 0),
    sale_price:
      row.sale_price == null ? null : Number(row.sale_price),
    level: (row.level as string) || "Başlangıç",
    language: (row.language as string) || "Türkçe",
    category: (row.category as string | null) ?? null,
    visibility:
      row.visibility === "private"
        ? "private"
        : ("public" as CoursesCache["visibility"]),
    what_will_learn: (row.what_will_learn as string | null) ?? null,
    target_audience: (row.target_audience as string | null) ?? null,
    published: Boolean(row.published),
    created_at: (row.created_at as string) || new Date().toISOString(),
    updated_at: (row.updated_at as string) || new Date().toISOString(),
  };
}

export async function getCourseCacheById(
  courseCacheId: string,
): Promise<CoursesCache | null> {
  const admin = getSupabaseAdmin();
  const lookupIds: Array<string | number> = [courseCacheId];

  if (/^\d+$/.test(courseCacheId)) {
    lookupIds.push(Number(courseCacheId));
  }

  for (const lookupId of lookupIds) {
    const { data, error } = await admin
      .from("courses_cache")
      .select("*")
      .eq("id", lookupId)
      .maybeSingle();

    if (!error && data) {
      return normalizeCoursesCacheRow(data as Record<string, unknown>);
    }
  }

  return null;
}

export async function requireCourseCacheAccess(
  courseCacheId: string,
): Promise<CoursesCache> {
  const access = await requireCurriculumAccess();
  const course = await getCourseCacheById(courseCacheId);

  if (!course) {
    throw new Error("COURSE_NOT_FOUND");
  }

  if (!access.isAdmin && course.instructor_wp_user_id !== access.wpInstructorId) {
    throw new Error("COURSE_ACCESS_DENIED");
  }

  return course;
}

export async function verifyCourseCacheAccess(
  courseCacheId: string,
): Promise<CoursesCache | null> {
  const access = await getCurriculumAccess();
  if (!access.canManage) {
    return null;
  }

  const course = await getCourseCacheById(courseCacheId);
  if (!course) {
    return null;
  }

  if (!access.isAdmin && course.instructor_wp_user_id !== access.wpInstructorId) {
    return null;
  }

  return course;
}

export function slugifyCourseTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function getCourseCacheIdByWpCourseId(
  wpCourseId: number,
): Promise<string | null> {
  const admin = getSupabaseAdmin();
  const { data } = await admin
    .from("courses_cache")
    .select("id")
    .eq("wp_course_id", wpCourseId)
    .maybeSingle();

  return normalizeCourseCacheId(data?.id as string | number | bigint | undefined);
}
