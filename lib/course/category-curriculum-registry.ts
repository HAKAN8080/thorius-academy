import { IK_CURRICULUM_I18N } from "@/lib/course/ik-curriculum-content";
import {
  PLANLAMA_CURRICULUM_I18N,
  type PlanlamaCurriculumI18n,
} from "@/lib/course/planlama-curriculum-content";

export type CategoryCurriculumI18n = PlanlamaCurriculumI18n;

export const ALL_CATEGORY_CURRICULUM_I18N: CategoryCurriculumI18n[] = [
  ...PLANLAMA_CURRICULUM_I18N,
  ...IK_CURRICULUM_I18N,
];

const curriculumBySlug = new Map(
  ALL_CATEGORY_CURRICULUM_I18N.map((entry) => [entry.course_slug, entry]),
);

export function getCategoryCurriculumI18n(
  courseSlug: string,
): CategoryCurriculumI18n | undefined {
  return curriculumBySlug.get(courseSlug);
}

/** @deprecated Use getCategoryCurriculumI18n */
export function getPlanlamaCurriculumI18n(
  courseSlug: string,
): CategoryCurriculumI18n | undefined {
  return getCategoryCurriculumI18n(courseSlug);
}
