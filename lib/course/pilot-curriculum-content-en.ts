import type { AppLocale } from "@/i18n/routing";
import { pickLocalized } from "@/lib/course/resolve-course-content";
import {
  getCategoryCurriculumI18n,
  ALL_CATEGORY_CURRICULUM_I18N,
  type CategoryCurriculumI18n,
} from "@/lib/course/category-curriculum-registry";

/** @deprecated Use CategoryCurriculumI18n */
export type PilotCurriculumContentEn = CategoryCurriculumI18n;

/** @deprecated Use ALL_CATEGORY_CURRICULUM_I18N */
export const PILOT_CURRICULUM_CONTENT_EN = ALL_CATEGORY_CURRICULUM_I18N;

function normalizeApostrophe(value: string): string {
  return value.replace(/\u2019/g, "'");
}

function lookupCurriculumMap(
  map: Record<string, string> | undefined,
  title: string,
): string | undefined {
  if (!map) return undefined;
  if (map[title]) return map[title];
  const normalized = normalizeApostrophe(title);
  for (const [key, value] of Object.entries(map)) {
    if (normalizeApostrophe(key) === normalized) return value;
  }
  return undefined;
}

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

  const maps = getCategoryCurriculumI18n(courseSlug);
  if (!maps) {
    return title;
  }

  if (locale === "en") {
    return (
      lookupCurriculumMap(maps.sections, title) ??
      lookupCurriculumMap(maps.lessons, title) ??
      title
    );
  }

  return (
    lookupCurriculumMap(maps.sections_tr, title) ??
    lookupCurriculumMap(maps.lessons_tr, title) ??
    title
  );
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
