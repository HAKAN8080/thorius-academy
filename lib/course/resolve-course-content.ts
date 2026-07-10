import { markdownToHtml, stripMarkdown } from "@/lib/markdown/to-html";
import type { AppLocale } from "@/i18n/routing";

export interface CourseContentSource {
  title?: string | null;
  subtitle?: string | null;
  description_md?: string | null;
  title_en?: string | null;
  subtitle_en?: string | null;
  description_md_en?: string | null;
  what_will_learn?: string | null;
  what_will_learn_en?: string | null;
  target_audience?: string | null;
  target_audience_en?: string | null;
  seo_title?: string | null;
  seo_title_en?: string | null;
  seo_description?: string | null;
  seo_description_en?: string | null;
}

export interface ResolvedCourseContent {
  title: string;
  subtitle: string;
  excerpt: string;
  descriptionMd: string;
  contentHtml: string;
  whatWillLearn: string;
  targetAudience: string;
  seoTitle: string;
  seoDescription: string;
  hasLocaleContent: boolean;
}

export function pickLocalized(
  locale: AppLocale,
  tr: string | null | undefined,
  en: string | null | undefined,
): string {
  if (locale === "en" && en?.trim()) {
    return en.trim();
  }
  return tr?.trim() ?? "";
}

export function hasLocalizedEnContent(source: CourseContentSource): boolean {
  return Boolean(
    source.title_en?.trim() ||
      source.subtitle_en?.trim() ||
      source.description_md_en?.trim() ||
      source.what_will_learn_en?.trim() ||
      source.target_audience_en?.trim(),
  );
}

export function resolveCourseContent(
  source: CourseContentSource,
  locale: AppLocale,
): ResolvedCourseContent {
  const title = pickLocalized(locale, source.title, source.title_en);
  const subtitle = pickLocalized(locale, source.subtitle, source.subtitle_en);
  const descriptionMd = pickLocalized(
    locale,
    source.description_md,
    source.description_md_en,
  );
  const whatWillLearn = pickLocalized(
    locale,
    source.what_will_learn,
    source.what_will_learn_en,
  );
  const targetAudience = pickLocalized(
    locale,
    source.target_audience,
    source.target_audience_en,
  );
  const seoTitle = pickLocalized(locale, source.seo_title, source.seo_title_en);
  const seoDescription = pickLocalized(
    locale,
    source.seo_description,
    source.seo_description_en,
  );

  const excerpt =
    subtitle ||
    stripMarkdown(descriptionMd).slice(0, 300) ||
    stripMarkdown(source.description_md).slice(0, 300);

  const contentHtml =
    markdownToHtml(descriptionMd) ||
    markdownToHtml(source.description_md) ||
    "";

  const hasLocaleContent =
    locale === "en" ? hasLocalizedEnContent(source) : true;

  return {
    title,
    subtitle,
    excerpt,
    descriptionMd,
    contentHtml,
    whatWillLearn,
    targetAudience,
    seoTitle,
    seoDescription,
    hasLocaleContent,
  };
}
