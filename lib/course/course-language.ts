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

export interface CourseLanguageMetaHints {
  subtitle?: string | null;
  descriptionMd?: string | null;
}

function inferSubtitleLanguageFromContent(
  subtitle?: string | null,
  descriptionMd?: string | null,
): CourseLanguageCode | null {
  const haystack = `${subtitle ?? ""} ${descriptionMd ?? ""}`.toLowerCase();

  if (/türkçe altyazı|turkish subtitles?/.test(haystack)) {
    return "tr";
  }

  if (/ingilizce altyazı|english subtitles?/.test(haystack)) {
    return "en";
  }

  return null;
}

export function resolveCourseLanguageMeta(
  language: string | null | undefined,
  subtitleLanguage?: string | null | undefined,
  hints?: CourseLanguageMetaHints,
): CourseLanguageMeta {
  const languageLabel = fromCoursesCacheLanguageLabel(language);
  const languageCode = toLanguageCode(language);

  const subtitleDb = subtitleLanguage?.trim()
    ? toCoursesCacheLanguageDbValue(subtitleLanguage)
    : null;

  let subtitleLanguageCode: CourseLanguageCode | null =
    subtitleDb === "english" ? "en" : subtitleDb === "turkish" ? "tr" : null;

  if (!subtitleLanguageCode) {
    subtitleLanguageCode = inferSubtitleLanguageFromContent(
      hints?.subtitle,
      hints?.descriptionMd,
    );
  }

  const resolvedSubtitleDb =
    subtitleLanguageCode === "en"
      ? "english"
      : subtitleLanguageCode === "tr"
        ? "turkish"
        : null;

  return {
    language: languageCode,
    languageLabel,
    subtitleLanguage: subtitleLanguageCode,
    subtitleLanguageLabel: subtitleLanguageCode
      ? fromCoursesCacheLanguageLabel(resolvedSubtitleDb)
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
      .select("language, subtitle_language, subtitle, description_md")
      .eq("course_slug", variant)
      .maybeSingle();

    if (data) {
      return resolveCourseLanguageMeta(data.language, data.subtitle_language, {
        subtitle: data.subtitle,
        descriptionMd: data.description_md,
      });
    }
  }

  return resolveCourseLanguageMeta(null, null);
}
