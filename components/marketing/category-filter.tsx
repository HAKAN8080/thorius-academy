import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import type { CourseLanguageCode } from "@/lib/course/course-language";
import { cn } from "@/lib/utils";

interface CategoryFilterItem {
  id: string;
  slug: string;
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryFilterItem[];
  selectedSlug?: string;
  selectedLanguage?: CourseLanguageCode;
  totalCount: number;
  searchQuery?: string;
  variant?: "light" | "dark";
}

export async function CategoryFilter({
  categories,
  selectedSlug,
  selectedLanguage,
  totalCount,
  searchQuery,
  variant = "light",
}: CategoryFilterProps) {
  const t = await getTranslations("courses.catalog");
  const isDark = variant === "dark";

  return (
    <div className="space-y-1">
      <h3
        className={cn(
          "mb-3 text-xs font-semibold uppercase tracking-wider",
          isDark ? "text-[#D4AF37]" : "text-muted-foreground",
        )}
      >
        {t("categories")}
      </h3>

      <Link
        href={buildKurslarUrl({ search: searchQuery, language: selectedLanguage })}
        className={cn(
          "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          !selectedSlug
            ? isDark
              ? "bg-[#D4AF37] text-[#0B1E3F]"
              : "bg-primary-950 text-white"
            : isDark
              ? "text-white/80 hover:bg-white/10"
              : "text-primary-900 hover:bg-primary-50",
        )}
      >
        {t("all")} ({totalCount})
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildKurslarUrl({
            categorySlug: cat.slug,
            search: searchQuery,
            language: selectedLanguage,
          })}
          className={cn(
            "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            selectedSlug === cat.slug
              ? isDark
                ? "bg-[#D4AF37] text-[#0B1E3F]"
                : "bg-primary-950 text-white"
              : isDark
                ? "text-white/80 hover:bg-white/10"
                : "text-primary-900 hover:bg-primary-50",
          )}
        >
          {cat.name} ({cat.count})
        </Link>
      ))}
    </div>
  );
}
