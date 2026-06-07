import { getUserEnrollments } from "@/lib/actions/enrollment";
import {
  computeSequentialStepStatuses,
  getCourseStepProgress,
} from "@/lib/career-path/progress";
import {
  getCareerPathBySlugFromDb,
  listCareerPathStepsFromDb,
  listCareerPathsFromDb,
} from "@/lib/career-path/repository";
import type {
  CareerPathStepWithStatus,
  CareerPathWithProgress,
} from "@/lib/career-path/types";
import { createClient } from "@/lib/supabase/server";
import type { Enrollment } from "@/types/enrollment";

async function getUserCareerPathEnrollmentIds(
  userId: string,
): Promise<Set<string>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("career_path_enrollments")
      .select("career_path_id")
      .eq("user_id", userId);

    if (error) {
      return new Set();
    }

    return new Set((data ?? []).map((row) => row.career_path_id as string));
  } catch {
    return new Set();
  }
}

function buildStepsWithStatus(
  steps: Awaited<ReturnType<typeof listCareerPathStepsFromDb>>,
  enrollmentBySlug: Map<string, Enrollment>,
): CareerPathStepWithStatus[] {
  const statuses = computeSequentialStepStatuses(
    steps.map((step) => step.course_slug),
    enrollmentBySlug,
  );

  return steps.map((step, index) => {
    const enrollment = enrollmentBySlug.get(step.course_slug);
    return {
      ...step,
      status: statuses[index],
      progressPercent: getCourseStepProgress(enrollment),
      courseTitle:
        enrollment?.course_title || step.fallback_title || step.label,
    };
  });
}

function summarizeProgress(
  steps: CareerPathStepWithStatus[],
  isEnrolled: boolean,
): Omit<CareerPathWithProgress, keyof CareerPathWithProgress> & {
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  isEnrolled: boolean;
} {
  const completedSteps = steps.filter(
    (step) => step.status === "completed",
  ).length;
  const totalSteps = steps.length;

  return {
    completedSteps,
    totalSteps,
    progressPercent:
      totalSteps > 0
        ? Math.round((completedSteps / totalSteps) * 100)
        : 0,
    isEnrolled:
      isEnrolled ||
      steps.some(
        (step) =>
          step.status === "in_progress" || step.status === "completed",
      ),
  };
}

export async function getUserCareerPathsWithProgress(): Promise<
  CareerPathWithProgress[]
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [paths, enrollments, enrolledPathIds] = await Promise.all([
    listCareerPathsFromDb(),
    getUserEnrollments(),
    user ? getUserCareerPathEnrollmentIds(user.id) : Promise.resolve(new Set()),
  ]);

  const enrollmentBySlug = new Map(
    enrollments.map((enrollment) => [enrollment.course_slug, enrollment]),
  );

  const results = await Promise.all(
    paths.map(async (path) => {
      const rawSteps = await listCareerPathStepsFromDb(path.id, path.slug);
      const steps = buildStepsWithStatus(rawSteps, enrollmentBySlug);
      const summary = summarizeProgress(
        steps,
        enrolledPathIds.has(path.id),
      );

      return {
        ...path,
        steps,
        ...summary,
      };
    }),
  );

  return results;
}

export async function getUserCareerPathWithProgress(
  slug: string,
): Promise<CareerPathWithProgress | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = await getCareerPathBySlugFromDb(slug);
  if (!path) {
    return null;
  }

  const [rawSteps, enrollments, enrolledPathIds] = await Promise.all([
    listCareerPathStepsFromDb(path.id, path.slug),
    getUserEnrollments(),
    user ? getUserCareerPathEnrollmentIds(user.id) : Promise.resolve(new Set()),
  ]);

  const enrollmentBySlug = new Map(
    enrollments.map((enrollment) => [enrollment.course_slug, enrollment]),
  );
  const steps = buildStepsWithStatus(rawSteps, enrollmentBySlug);
  const summary = summarizeProgress(steps, enrolledPathIds.has(path.id));

  return {
    ...path,
    steps,
    ...summary,
  };
}
