/** Production courses_cache (legacy Tutor şeması) yazma değerleri. */

const LEVEL_TO_DB: Record<string, string> = {
  "Başlangıç": "beginner",
  Orta: "intermediate",
  İleri: "expert",
  beginner: "beginner",
  intermediate: "intermediate",
  expert: "expert",
  advanced: "expert",
  all_levels: "all_levels",
};

const LEVEL_FROM_DB: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  expert: "İleri",
  advanced: "İleri",
  all_levels: "Başlangıç",
};

const LANGUAGE_TO_DB: Record<string, string> = {
  Türkçe: "turkish",
  İngilizce: "english",
  turkish: "turkish",
  english: "english",
  tr: "turkish",
  en: "english",
};

const LANGUAGE_FROM_DB: Record<string, string> = {
  turkish: "Türkçe",
  english: "İngilizce",
  tr: "Türkçe",
  en: "İngilizce",
};

export function toCoursesCacheLevelDbValue(level: string | null | undefined): string {
  if (!level?.trim()) return "beginner";
  return LEVEL_TO_DB[level.trim()] ?? "beginner";
}

export function fromCoursesCacheLevelLabel(
  level: string | null | undefined,
): string {
  if (!level?.trim()) return "Başlangıç";
  return LEVEL_FROM_DB[level.trim()] ?? level;
}

export function toCoursesCacheLanguageDbValue(
  language: string | null | undefined,
): string {
  if (!language?.trim()) return "turkish";
  return LANGUAGE_TO_DB[language.trim()] ?? "turkish";
}

export function fromCoursesCacheLanguageLabel(
  language: string | null | undefined,
): string {
  if (!language?.trim()) return "Türkçe";
  return LANGUAGE_FROM_DB[language.trim()] ?? language;
}

export function normalizeCoursesCacheWritePayload(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...payload };

  if (typeof next.level === "string") {
    next.level = toCoursesCacheLevelDbValue(next.level);
  }

  if (typeof next.language === "string") {
    next.language = toCoursesCacheLanguageDbValue(next.language);
  }

  return next;
}
