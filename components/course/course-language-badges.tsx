"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import {
  courseLanguageFlag,
  courseLanguageShortLabel,
  type CourseLanguageCode,
} from "@/lib/course/course-language";

interface CourseLanguageBadgesProps {
  language: CourseLanguageCode;
  subtitleLanguage?: CourseLanguageCode | null;
  className?: string;
  overlay?: boolean;
  size?: "md" | "lg";
}

export function CourseLanguageBadges({
  language,
  subtitleLanguage,
  className,
  overlay = false,
  size,
}: CourseLanguageBadgesProps) {
  const t = useTranslations("courses.language");
  const resolvedSize = size ?? (overlay ? "lg" : "md");
  const hasSubtitle = subtitleLanguage != null;
  const subtitleDiffers =
    hasSubtitle && subtitleLanguage !== language;
  const languageLabel = courseLanguageShortLabel(language);

  const badgeClass = cn(
    "inline-flex items-center rounded-full font-semibold shadow-md",
    resolvedSize === "lg"
      ? "gap-2 px-3 py-1.5 text-sm"
      : "gap-1.5 px-2.5 py-1 text-xs",
    overlay
      ? "border border-white/25 bg-primary-950/90 text-white backdrop-blur-sm"
      : "border border-primary-100 bg-white text-primary-900",
  );

  const prefixClass = cn(
    "font-medium opacity-90",
    resolvedSize === "lg" ? "text-sm" : "text-xs",
  );

  const flagClass = cn(
    "shrink-0 leading-none",
    resolvedSize === "lg" ? "text-[1.45rem]" : "text-lg",
  );

  const codeClass = cn(
    "font-bold tracking-wide",
    resolvedSize === "lg" ? "text-sm" : "text-xs",
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center",
        resolvedSize === "lg" ? "gap-2" : "gap-1.5",
        overlay && "pointer-events-none",
        className,
      )}
      aria-label={
        hasSubtitle
          ? subtitleDiffers
            ? t("courseWithSubtitleLangAria", {
                language: languageLabel,
                subtitle: courseLanguageShortLabel(subtitleLanguage),
              })
            : t("courseWithSubtitlesAria", { language: languageLabel })
          : t("courseLanguageAria", { language: languageLabel })
      }
    >
      <span
        className={badgeClass}
        title={t("courseLanguageTitle", { language: languageLabel })}
      >
        <span className={prefixClass}>{t("languageLabel")}</span>
        <span className={flagClass} aria-hidden="true">
          {courseLanguageFlag(language)}
        </span>
        <span className={codeClass}>{languageLabel}</span>
      </span>

      {hasSubtitle ? (
        <span
          className={badgeClass}
          title={
            subtitleDiffers
              ? t("subtitleTitle", {
                  subtitle: courseLanguageShortLabel(subtitleLanguage),
                })
              : t("subtitled")
          }
        >
          <span className={prefixClass}>{t("subtitleLabel")}</span>
          {subtitleDiffers ? (
            <>
              <span className={flagClass} aria-hidden="true">
                {courseLanguageFlag(subtitleLanguage)}
              </span>
              <span className={codeClass}>
                {courseLanguageShortLabel(subtitleLanguage)}
              </span>
            </>
          ) : (
            <span className={codeClass}>{t("subtitled")}</span>
          )}
        </span>
      ) : null}
    </div>
  );
}
