import { COMPLETION_PROGRESS_THRESHOLD } from "@/lib/career-path/progress-constants";
import { resolveCourseEnrollmentMeta } from "@/lib/career-path/enrollment-meta";
import { listCareerPathStepsFromDb } from "@/lib/career-path/repository";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

type EnrollmentInsert = Database["public"]["Tables"]["enrollments"]["Insert"];

export async function unlockNextStepAfterCompletion(
  userId: string,
  completedCourseSlug: string,
): Promise<string | null> {
  const admin = getSupabaseAdmin();

  const { data: pathEnrollments, error: pathError } = await admin
    .from("career_path_enrollments")
    .select("career_path_id")
    .eq("user_id", userId);

  if (pathError || !pathEnrollments?.length) {
    return null;
  }

  for (const pathEnrollment of pathEnrollments) {
    const careerPathId = pathEnrollment.career_path_id as string;
    const { data: pathRow } = await admin
      .from("career_paths")
      .select("slug")
      .eq("id", careerPathId)
      .maybeSingle();

    const pathSlug = (pathRow?.slug as string) || undefined;
    const steps = await listCareerPathStepsFromDb(careerPathId, pathSlug);
    const completedIndex = steps.findIndex(
      (step) => step.course_slug === completedCourseSlug,
    );

    if (completedIndex < 0 || completedIndex >= steps.length - 1) {
      continue;
    }

    const nextStep = steps[completedIndex + 1];
    const { data: existingEnrollment } = await admin
      .from("enrollments")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", nextStep.course_slug)
      .neq("status", "cancelled")
      .maybeSingle();

    if (existingEnrollment) {
      continue;
    }

    const courseMeta = await resolveCourseEnrollmentMeta(nextStep.course_slug);
    if (!courseMeta) {
      console.warn(
        "[Career Path Drip] Course meta missing:",
        nextStep.course_slug,
      );
      continue;
    }

    const enrollmentPayload: EnrollmentInsert = {
      user_id: userId,
      course_slug: courseMeta.course_slug,
      course_id: courseMeta.course_id,
      course_title: courseMeta.course_title,
      course_image: courseMeta.course_image,
      course_category: courseMeta.course_category,
      instructor_name: courseMeta.instructor_name,
      status: "active",
      enrolled_at: new Date().toISOString(),
      source: "career_path_drip",
      wc_order_id: null,
    };

    const { error: enrollError } = await admin
      .from("enrollments")
      .insert(enrollmentPayload);

    if (enrollError) {
      console.error("[Career Path Drip] Enrollment failed:", enrollError.message);
      continue;
    }

    return nextStep.course_slug;
  }

  return null;
}

export function shouldTriggerCareerPathDrip(progress: number, isComplete: boolean): boolean {
  return isComplete || progress >= COMPLETION_PROGRESS_THRESHOLD;
}
