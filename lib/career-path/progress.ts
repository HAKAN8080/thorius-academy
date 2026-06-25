import { COMPLETION_PROGRESS_THRESHOLD } from "@/lib/career-path/progress-constants";
import type { CareerPathStepStatus } from "@/lib/career-path/types";
import type { Enrollment } from "@/types/enrollment";

export function isCourseStepCompleted(
  enrollment: Enrollment | undefined,
): boolean {
  if (!enrollment) {
    return false;
  }

  if (enrollment.status === "completed") {
    return true;
  }

  return enrollment.progress >= COMPLETION_PROGRESS_THRESHOLD;
}

export function getCourseStepProgress(
  enrollment: Enrollment | undefined,
): number {
  if (!enrollment) {
    return 0;
  }

  if (enrollment.status === "completed") {
    return 100;
  }

  return Math.max(0, Math.min(100, enrollment.progress));
}

export function computeSequentialStepStatuses(
  courseSlugs: string[],
  enrollmentBySlug: Map<string, Enrollment>,
): CareerPathStepStatus[] {
  const statuses: CareerPathStepStatus[] = [];
  let previousCompleted = true;

  for (const slug of courseSlugs) {
    const enrollment = enrollmentBySlug.get(slug);
    const completed = isCourseStepCompleted(enrollment);

    if (!previousCompleted) {
      statuses.push("locked");
    } else if (completed) {
      statuses.push("completed");
    } else if (enrollment && enrollment.progress > 0) {
      statuses.push("in_progress");
    } else {
      statuses.push("available");
    }

    previousCompleted = completed;
  }

  return statuses;
}
