import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import {
  courseLanguageFlag,
  courseLanguageShortLabel,
  type CourseLanguageCode,
} from "@/lib/course/course-language";
import type { CatalogLanguageItem } from "@/lib/course/courses-cache-catalog";
import { cn } from "@/lib/utils";

interface LanguageFilterProps {
  languages: CatalogLanguageItem[];
  selectedLanguage?: CourseLanguageCode;
  totalCount: number;
  categorySlug?: string;
  searchQuery?: string;
  variant?: "light" | "dark";
}

export async function LanguageFilter({
  languages,
  selectedLanguage,
  totalCount,
  categorySlug,
  searchQuery,
  variant = "light",
}: LanguageFilterProps) {
  const t = await getTranslations("courses.catalog");
  const isDark = variant === "dark";

  if (languages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      <h3
        className={cn(
          "mb-3 text-xs font-semibold uppercase tracking-wider",
          isDark ? "text-[#D4AF37]" : "text-muted-foreground",
        )}
      >
        {t("languages")}
      </h3>

      <Link
        href={buildKurslarUrl({ categorySlug, search: searchQuery })}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          !selectedLanguage
            ? isDark
              ? "bg-[#D4AF37] text-[#0B1E3F]"
              : "bg-primary-950 text-white"
            : isDark
              ? "text-white/80 hover:bg-white/10"
              : "text-primary-900 hover:bg-primary-50",
        )}
      >
        <span>{t("allLanguages")}</span>
        <span className="opacity-80">({totalCount})</span>
      </Link>

      {languages.map((item) => {
        const label = courseLanguageShortLabel(item.code);
        const flag = courseLanguageFlag(item.code);

        return (
          <Link
            key={item.code}
            href={buildKurslarUrl({
              categorySlug,
              search: searchQuery,
              language: item.code,
            })}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              selectedLanguage === item.code
                ? isDark
                  ? "bg-[#D4AF37] text-[#0B1E3F]"
                  : "bg-primary-950 text-white"
                : isDark
                  ? "text-white/80 hover:bg-white/10"
                  : "text-primary-900 hover:bg-primary-50",
            )}
          >
            <span className="text-lg leading-none" aria-hidden="true">
              {flag}
            </span>
            <span className="font-semibold tracking-wide">{label}</span>
            <span className="opacity-80">({item.count})</span>
          </Link>
        );
      })}
    </div>
  );
}
