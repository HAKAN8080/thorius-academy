import type { CareerPathStep } from "@/lib/content/career-path-types";
import type { Course } from "@/types/wordpress";

/** Kariyer yolu adımlarındaki slug sırasına göre katalogdan kursları eşleştirir. */
export function pickCareerPathCourses(
  courses: Course[],
  steps: CareerPathStep[],
): Course[] {
  const courseBySlug = new Map(courses.map((course) => [course.slug, course]));

  return steps
    .map((step) => courseBySlug.get(step.slug))
    .filter((course): course is Course => course != null);
}
