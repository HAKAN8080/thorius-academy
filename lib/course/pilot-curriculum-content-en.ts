import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/course/resolve-course-content";
import {
  getPlanlamaCurriculumI18n,
  PLANLAMA_CURRICULUM_I18N,
  type PlanlamaCurriculumI18n,
} from "@/lib/course/planlama-curriculum-content";

/** @deprecated Use PLANLAMA_CURRICULUM_I18N — kept for backfill script compat */
export type PilotCurriculumContentEn = PlanlamaCurriculumI18n;

/** @deprecated Use PLANLAMA_CURRICULUM_I18N */
export const PILOT_CURRICULUM_CONTENT_EN = PLANLAMA_CURRICULUM_I18N;

function resolveFromMaps(
  locale: AppLocale,
  courseSlug: string,
  title: string,
  dbEn?: string | null,
): string {
  const localized = pickLocalized(locale, title, dbEn);
  if (localized !== title) {
    return localized;
  }

  const maps = getPlanlamaCurriculumI18n(courseSlug);
  if (!maps) {
    return title;
  }

  if (locale === "en") {
    return maps.sections[title] ?? maps.lessons[title] ?? title;
  }

  return maps.sections_tr?.[title] ?? maps.lessons_tr?.[title] ?? title;
}

export function resolveCurriculumTitle(
  locale: AppLocale,
  courseSlug: string,
  trTitle: string,
  dbEn?: string | null,
): string {
  return resolveFromMaps(locale, courseSlug, trTitle, dbEn);
}

const SECTION_FALLBACK_EN: Record<string, string> = {
  Müfredat: "Curriculum",
  Diğer: "Other",
};

export function resolveCurriculumSectionTitle(
  locale: AppLocale,
  courseSlug: string,
  trTitle: string,
  dbEn?: string | null,
): string {
  const resolved = resolveCurriculumTitle(locale, courseSlug, trTitle, dbEn);
  if (locale === "en" && resolved === trTitle) {
    return SECTION_FALLBACK_EN[trTitle] ?? trTitle;
  }
  return resolved;
}
