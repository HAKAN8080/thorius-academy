"use client";

import { useTranslations } from "next-intl";
import { Captions } from "lucide-react";
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
}

export function CourseLanguageBadges({
  language,
  subtitleLanguage,
  className,
  overlay = false,
}: CourseLanguageBadgesProps) {
  const t = useTranslations("courses.language");
  const hasSubtitle = subtitleLanguage != null;
  const subtitleDiffers =
    hasSubtitle && subtitleLanguage !== language;
  const languageLabel = courseLanguageShortLabel(language);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5",
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
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-semibold shadow-md",
          overlay
            ? "border border-white/20 bg-primary-950/85 px-2 py-1 text-[11px] text-white backdrop-blur-sm"
            : "border border-primary-100 bg-white px-2 py-1 text-[11px] text-primary-900",
        )}
        title={t("courseLanguageTitle", { language: languageLabel })}
      >
        <span aria-hidden="true">{courseLanguageFlag(language)}</span>
        <span>{languageLabel}</span>
      </span>

      {hasSubtitle ? (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full font-semibold shadow-md",
            overlay
              ? "border border-white/20 bg-primary-950/85 px-2 py-1 text-[11px] text-white backdrop-blur-sm"
              : "border border-primary-100 bg-white px-2 py-1 text-[11px] text-primary-900",
          )}
          title={
            subtitleDiffers
              ? t("subtitleTitle", {
                  subtitle: courseLanguageShortLabel(subtitleLanguage),
                })
              : t("subtitled")
          }
        >
          <Captions className="h-3 w-3" aria-hidden="true" />
          {subtitleDiffers ? (
            <>
              <span aria-hidden="true">
                {courseLanguageFlag(subtitleLanguage)}
              </span>
              <span>{courseLanguageShortLabel(subtitleLanguage)}</span>
            </>
          ) : (
            <span>{t("subtitled")}</span>
          )}
        </span>
      ) : null}
    </div>
  );
}
