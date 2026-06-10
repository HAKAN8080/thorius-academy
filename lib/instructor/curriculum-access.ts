import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getInstructorAccess } from "@/lib/instructor/access";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";

export type CurriculumRole = "student" | "instructor" | "admin";

export interface CurriculumAccess {
  userId: string;
  role: CurriculumRole;
  wpInstructorId: number | null;
  isAdmin: boolean;
  canManage: boolean;
}

export const getCurriculumAccess = cache(async (): Promise<CurriculumAccess> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      userId: "",
      role: "student",
      wpInstructorId: null,
      isAdmin: false,
      canManage: false,
    };
  }

  const admin = getSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("role, wp_instructor_id")
    .eq("id", user.id)
    .maybeSingle();

  const instructorAccess = await getInstructorAccess();
  const isAdmin =
    profile?.role === "admin" || (await isCareerPathAdmin());
  const role = (profile?.role as CurriculumRole | null) ?? "student";
  const canManage =
    isAdmin ||
    role === "admin" ||
    role === "instructor" ||
    instructorAccess.isInstructor;

  return {
    userId: user.id,
    role: isAdmin ? "admin" : role,
    wpInstructorId: instructorAccess.wpInstructorId,
    isAdmin,
    canManage,
  };
});

export async function requireCurriculumAccess(): Promise<CurriculumAccess> {
  const access = await getCurriculumAccess();
  if (!access.canManage) {
    throw new Error("CURRICULUM_ACCESS_DENIED");
  }
  return access;
}

export async function verifyInstructorCourseAccess(
  courseId: number,
  access: CurriculumAccess,
): Promise<{ course_slug: string; course_title: string } | null> {
  const admin = getSupabaseAdmin();

  let query = admin
    .from("instructor_course_stats")
    .select("course_slug, title")
    .eq("wp_course_id", courseId);

  if (!access.isAdmin && access.wpInstructorId) {
    query = query.eq("instructor_wp_user_id", access.wpInstructorId);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return {
    course_slug: data.course_slug as string,
    course_title: data.title as string,
  };
}
