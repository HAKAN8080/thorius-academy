import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getCurriculumAccess,
  requireCurriculumAccess,
} from "@/lib/instructor/curriculum-access";
import type { CoursesCache } from "@/types/instructor-course";

export async function getCourseCacheById(
  courseCacheId: string,
): Promise<CoursesCache | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("courses_cache")
    .select("*")
    .eq("id", courseCacheId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as CoursesCache;
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

  return (data?.id as string | undefined) ?? null;
}
