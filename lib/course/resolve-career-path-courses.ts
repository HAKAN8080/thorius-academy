import type { CareerPathStep } from "@/lib/content/retail-planning-career-path";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import type { Course } from "@/types/wordpress";

export interface ResolvedCareerPathStep extends CareerPathStep {
  course: Course | null;
}

export async function resolveCareerPathSteps(
  steps: CareerPathStep[],
): Promise<ResolvedCareerPathStep[]> {
  const resolved = await Promise.all(
    steps.map(async (step) => {
      const course = await fetchCourseBySlug(step.slug);
      return { ...step, course };
    }),
  );

  return resolved;
}
