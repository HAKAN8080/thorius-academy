import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import type { CourseLanguageCode } from "@/lib/course/course-language";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  categorySlug?: string;
  language?: CourseLanguageCode;
  searchQuery?: string;
  variant?: "light" | "dark";
}

function getVisiblePages(
  current: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages, current, current - 1, current + 1]);
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];

  for (let index = 0; index < sorted.length; index += 1) {
    const page = sorted[index];
    const previous = sorted[index - 1];

    if (index > 0 && previous !== undefined && page - previous > 1) {
      result.push("ellipsis");
    }

    result.push(page);
  }

  return result;
}

export async function CatalogPagination({
  page,
  totalPages,
  total,
  categorySlug,
  language,
  searchQuery,
  variant = "light",
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const t = await getTranslations("courses.catalog");
  const isDark = variant === "dark";
  const visiblePages = getVisiblePages(page, totalPages);
  const prevHref =
    page > 1
      ? buildKurslarUrl({ page: page - 1, categorySlug, language, search: searchQuery })
      : null;
  const nextHref =
    page < totalPages
      ? buildKurslarUrl({
          page: page + 1,
          categorySlug,
          language,
          search: searchQuery,
        })
      : null;

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4"
      aria-label={t("paginationAria")}
    >
      <p className={cn("text-sm", isDark ? "text-white/70" : "text-muted-foreground")}>
        {t("paginationSummary", { total, page, totalPages })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors",
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-primary-100 text-primary-900 hover:bg-primary-50",
            )}
            aria-label={t("prevPageAria")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("prevPage")}
          </Link>
        ) : (
          <span
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm",
              isDark
                ? "border-white/10 text-white/40"
                : "border-primary-50 text-muted-foreground",
            )}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            {t("prevPage")}
          </span>
        )}

        {visiblePages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-sm text-muted-foreground"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <Link
              key={item}
              href={buildKurslarUrl({
                page: item,
                categorySlug,
                language,
                search: searchQuery,
              })}
              aria-label={t("pageAria", { page: item })}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
                item === page
                  ? isDark
                    ? "bg-[#D4AF37] text-[#0B1E3F]"
                    : "bg-primary-950 text-white"
                  : isDark
                    ? "border border-white/20 text-white hover:bg-white/10"
                    : "border border-primary-100 text-primary-900 hover:bg-primary-50",
              )}
            >
              {item}
            </Link>
          ),
        )}

        {nextHref ? (
          <Link
            href={nextHref}
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm font-medium transition-colors",
              isDark
                ? "border-white/20 text-white hover:bg-white/10"
                : "border-primary-100 text-primary-900 hover:bg-primary-50",
            )}
            aria-label={t("nextPageAria")}
          >
            {t("nextPage")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span
            className={cn(
              "inline-flex h-10 items-center gap-1 rounded-lg border px-3 text-sm",
              isDark
                ? "border-white/10 text-white/40"
                : "border-primary-50 text-muted-foreground",
            )}
          >
            {t("nextPage")}
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
