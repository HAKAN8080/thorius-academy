import { getTranslations } from "next-intl/server";
import { Languages } from "lucide-react";
import {
  courseLanguageFlag,
  courseLanguageShortLabel,
  type CourseLanguageCode,
} from "@/lib/course/course-language";

interface CourseContentLanguageNoticeProps {
  pageLocale: string;
  courseLanguage: CourseLanguageCode;
  hasLocaleContent?: boolean;
  variant?: "light" | "dark";
}

export async function CourseContentLanguageNotice({
  pageLocale,
  courseLanguage,
  hasLocaleContent = false,
  variant = "light",
}: CourseContentLanguageNoticeProps) {
  if (pageLocale === courseLanguage || hasLocaleContent) {
    return null;
  }

  const t = await getTranslations("courses.contentLanguage");
  const languageLabel = courseLanguageShortLabel(courseLanguage);
  const isDark = variant === "dark";

  return (
    <div
      className={
        isDark
          ? "mb-2 flex gap-3 rounded-xl border border-amber-300/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-50"
          : "mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950"
      }
      role="status"
    >
      <Languages
        className={
          isDark
            ? "mt-0.5 h-4 w-4 shrink-0 text-amber-200"
            : "mt-0.5 h-4 w-4 shrink-0 text-amber-700"
        }
        aria-hidden="true"
      />
      <div>
        <p className="font-semibold">
          {t("noticeTitle", {
            language: languageLabel,
            flag: courseLanguageFlag(courseLanguage),
          })}
        </p>
        <p className={isDark ? "mt-1 text-amber-50/90" : "mt-1 text-amber-900/90"}>
          {t("noticeBody")}
        </p>
      </div>
    </div>
  );
}
