import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import { cn } from "@/lib/utils";

interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  total: number;
  categorySlug?: string;
  searchQuery?: string;
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

export function CatalogPagination({
  page,
  totalPages,
  total,
  categorySlug,
  searchQuery,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);
  const prevHref =
    page > 1
      ? buildKurslarUrl({ page: page - 1, categorySlug, search: searchQuery })
      : null;
  const nextHref =
    page < totalPages
      ? buildKurslarUrl({
          page: page + 1,
          categorySlug,
          search: searchQuery,
        })
      : null;

  return (
    <nav
      className="mt-10 flex flex-col items-center gap-4"
      aria-label="Kurs sayfaları"
    >
      <p className="text-sm text-muted-foreground">
        Toplam {total} kurs · Sayfa {page} / {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {prevHref ? (
          <Link
            href={prevHref}
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-primary-100 px-3 text-sm font-medium text-primary-900 transition-colors hover:bg-primary-50"
            aria-label="Önceki sayfa"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Önceki
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center gap-1 rounded-lg border border-primary-50 px-3 text-sm text-muted-foreground">
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Önceki
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
                search: searchQuery,
              })}
              aria-label={`Sayfa ${item}`}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-10 min-w-10 items-center justify-center rounded-lg px-3 text-sm font-medium transition-colors",
                item === page
                  ? "bg-primary-950 text-white"
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
            className="inline-flex h-10 items-center gap-1 rounded-lg border border-primary-100 px-3 text-sm font-medium text-primary-900 transition-colors hover:bg-primary-50"
            aria-label="Sonraki sayfa"
          >
            Sonraki
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <span className="inline-flex h-10 items-center gap-1 rounded-lg border border-primary-50 px-3 text-sm text-muted-foreground">
            Sonraki
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </span>
        )}
      </div>
    </nav>
  );
}
