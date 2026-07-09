import {
  fromCoursesCacheLanguageLabel,
  toCoursesCacheLanguageDbValue,
} from "@/lib/instructor/courses-cache-write";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { getSupabasePublicClient } from "@/lib/supabase/public";

export type CourseLanguageCode = "tr" | "en";

export interface CourseLanguageMeta {
  language: CourseLanguageCode;
  languageLabel: string;
  subtitleLanguage: CourseLanguageCode | null;
  subtitleLanguageLabel: string | null;
}

function toLanguageCode(value: string | null | undefined): CourseLanguageCode {
  const normalized = toCoursesCacheLanguageDbValue(value);
  return normalized === "english" ? "en" : "tr";
}

export function resolveCourseLanguageMeta(
  language: string | null | undefined,
  subtitleLanguage?: string | null | undefined,
): CourseLanguageMeta {
  const languageLabel = fromCoursesCacheLanguageLabel(language);
  const languageCode = toLanguageCode(language);

  const subtitleDb = subtitleLanguage?.trim()
    ? toCoursesCacheLanguageDbValue(subtitleLanguage)
    : null;

  const subtitleLanguageCode =
    subtitleDb === "english" ? "en" : subtitleDb === "turkish" ? "tr" : null;

  return {
    language: languageCode,
    languageLabel,
    subtitleLanguage: subtitleLanguageCode,
    subtitleLanguageLabel: subtitleLanguageCode
      ? fromCoursesCacheLanguageLabel(subtitleDb)
      : null,
  };
}

export function toCoursesCacheSubtitleLanguageDbValue(
  subtitleLanguage: string | null | undefined,
): string | null {
  if (!subtitleLanguage?.trim() || subtitleLanguage === "Yok") {
    return null;
  }
  return toCoursesCacheLanguageDbValue(subtitleLanguage);
}

export function fromCoursesCacheSubtitleLanguageLabel(
  subtitleLanguage: string | null | undefined,
): string {
  if (!subtitleLanguage?.trim()) {
    return "Yok";
  }
  return fromCoursesCacheLanguageLabel(subtitleLanguage);
}

export function courseLanguageFlag(code: CourseLanguageCode): string {
  return code === "en" ? "🇬🇧" : "🇹🇷";
}

export function courseLanguageShortLabel(code: CourseLanguageCode): string {
  return code === "en" ? "EN" : "TR";
}

export async function getCourseLanguageMetaBySlug(
  slug: string,
): Promise<CourseLanguageMeta> {
  const supabase = getSupabasePublicClient();

  for (const variant of getCourseSlugLookupVariants(slug)) {
    const { data } = await supabase
      .from("courses_cache")
      .select("language, subtitle_language")
      .eq("course_slug", variant)
      .maybeSingle();

    if (data) {
      return resolveCourseLanguageMeta(data.language, data.subtitle_language);
    }
  }

  return resolveCourseLanguageMeta(null, null);
}
