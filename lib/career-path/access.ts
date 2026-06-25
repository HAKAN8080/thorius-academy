import {
  computeSequentialStepStatuses,
  isCourseStepCompleted,
} from "@/lib/career-path/progress";
import { listCareerPathStepsFromDb } from "@/lib/career-path/repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Enrollment } from "@/types/enrollment";

async function getPathEnrollmentsForUser(userId: string) {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("career_path_enrollments")
    .select("career_path_id")
    .eq("user_id", userId);

  if (error || !data?.length) {
    return [];
  }

  return data.map((row) => row.career_path_id as string);
}

async function getUserEnrollmentBySlug(
  userId: string,
): Promise<Map<string, Enrollment>> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .neq("status", "cancelled");

  if (error || !data) {
    return new Map();
  }

  return new Map(
    (data as Enrollment[]).map((enrollment) => [
      enrollment.course_slug,
      enrollment,
    ]),
  );
}

export async function canAccessCourseViaCareerPath(
  userId: string,
  courseSlug: string,
  enrollment?: Enrollment | null,
): Promise<boolean> {
  if (enrollment && enrollment.source !== "career_path_drip") {
    return true;
  }

  const pathIds = await getPathEnrollmentsForUser(userId);
  if (pathIds.length === 0) {
    return true;
  }

  const enrollmentBySlug = await getUserEnrollmentBySlug(userId);
  const admin = getSupabaseAdmin();

  for (const careerPathId of pathIds) {
    const { data: pathRow } = await admin
      .from("career_paths")
      .select("slug")
      .eq("id", careerPathId)
      .maybeSingle();

    const pathSlug = (pathRow?.slug as string) || undefined;
    const steps = await listCareerPathStepsFromDb(careerPathId, pathSlug);
    const stepIndex = steps.findIndex((step) => step.course_slug === courseSlug);

    if (stepIndex < 0) {
      continue;
    }

    const statuses = computeSequentialStepStatuses(
      steps.map((step) => step.course_slug),
      enrollmentBySlug,
    );

    if (statuses[stepIndex] !== "locked") {
      return true;
    }
  }

  if (!enrollment) {
    return false;
  }

  return isCourseStepCompleted(enrollment);
}
