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
  const hasSubtitle = subtitleLanguage != null;
  const subtitleDiffers =
    hasSubtitle && subtitleLanguage !== language;

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
            ? `Kurs dili ${courseLanguageShortLabel(language)}, altyazı ${courseLanguageShortLabel(subtitleLanguage)}`
            : `Kurs dili ${courseLanguageShortLabel(language)}, altyazılı`
          : `Kurs dili ${courseLanguageShortLabel(language)}`
      }
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-semibold shadow-md",
          overlay
            ? "border border-white/20 bg-primary-950/85 px-2 py-1 text-[11px] text-white backdrop-blur-sm"
            : "border border-primary-100 bg-white px-2 py-1 text-[11px] text-primary-900",
        )}
        title={`Kurs dili: ${courseLanguageShortLabel(language)}`}
      >
        <span aria-hidden="true">{courseLanguageFlag(language)}</span>
        <span>{courseLanguageShortLabel(language)}</span>
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
              ? `Altyazı: ${courseLanguageShortLabel(subtitleLanguage)}`
              : "Altyazılı"
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
            <span>Altyazılı</span>
          )}
        </span>
      ) : null}
    </div>
  );
}
