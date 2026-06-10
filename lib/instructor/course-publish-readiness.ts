import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  requireCourseCacheAccess,
} from "@/lib/instructor/course-cache-access";
import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";
import type { CourseBasicsInput } from "@/types/instructor-course";

export interface CoursePublishReadiness {
  ready: boolean;
  missing: string[];
}

export async function getCoursePublishReadiness(
  courseCacheId: string,
  input: CourseBasicsInput,
  existingSlug: string | null,
): Promise<CoursePublishReadiness> {
  const missing: string[] = [];

  if (!input.title.trim()) {
    missing.push("Kurs başlığı");
  }

  const slug =
    input.course_slug?.trim() ||
    existingSlug?.trim() ||
    slugifyCourseTitle(input.title);

  if (!slug || slug.length < 3) {
    missing.push("Kurs URL adresi");
  }

  if (!input.category?.trim()) {
    missing.push("Kategori");
  }

  if (!input.description_md?.trim()) {
    missing.push("Açıklama");
  }

  if (!input.cover_image_url?.trim()) {
    missing.push("Kapak görseli");
  }

  if (input.pricing_model === "paid" && (!input.price || input.price <= 0)) {
    missing.push("Fiyat");
  }

  const admin = getSupabaseAdmin();
  const course = await requireCourseCacheAccess(courseCacheId);

  const { count: sectionCount } = await admin
    .from("sections")
    .select("*", { count: "exact", head: true })
    .eq("course_id", courseCacheId);

  if (!sectionCount) {
    missing.push("En az bir bölüm (Müfredat adımı)");
  }

  if (!course.wp_course_id) {
    missing.push("Kurs kaydı");
  } else {
    const { count: lessonCount } = await admin
      .from("lessons")
      .select("*", { count: "exact", head: true })
      .eq("course_id", course.wp_course_id);

    if (!lessonCount) {
      missing.push("En az bir ders (Müfredat adımı)");
    }
  }

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function formatPublishReadinessError(missing: string[]): string {
  return `Kurs yayına alınamaz. Eksik alanlar: ${missing.join(", ")}`;
}
