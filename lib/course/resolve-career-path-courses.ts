import type { CareerPathStep } from "@/lib/content/career-path-types";
import { fetchLocalizedCourseBySlug } from "@/lib/course/fetch-localized-course-by-slug";
import type { Course } from "@/types/wordpress";

export interface ResolvedCareerPathStep extends CareerPathStep {
  course: Course | null;
}

export async function resolveCareerPathSteps(
  steps: CareerPathStep[],
): Promise<ResolvedCareerPathStep[]> {
  const resolved = await Promise.all(
    steps.map(async (step) => {
      try {
        const course = await fetchLocalizedCourseBySlug(step.slug, "tr");
        return { ...step, course };
      } catch (error) {
        console.error(
          "[resolve-career-path] cache lookup failed:",
          step.slug,
          error,
        );
        return { ...step, course: null };
      }
    }),
  );

  return resolved;
}
