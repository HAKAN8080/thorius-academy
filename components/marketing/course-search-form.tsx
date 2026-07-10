"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import { cn } from "@/lib/utils";

interface CourseSearchFormProps {
  defaultQuery?: string;
  categorySlug?: string;
  variant?: "light" | "dark";
}

export function CourseSearchForm({
  defaultQuery,
  categorySlug,
  variant = "light",
}: CourseSearchFormProps) {
  const t = useTranslations("courses.catalog");
  const locale = useLocale();
  const hasQuery = Boolean(defaultQuery?.trim());
  const isDark = variant === "dark";

  return (
    <form action={`/${locale}/kurslar`} method="get" className="w-full">
      {categorySlug ? (
        <input type="hidden" name="kategori" value={categorySlug} />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
              isDark ? "text-white/50" : "text-muted-foreground",
            )}
            aria-hidden="true"
          />
          <Input
            type="search"
            name="ara"
            defaultValue={defaultQuery ?? ""}
            placeholder={t("searchPlaceholder")}
            className={cn(
              "h-11 rounded-xl pl-10 pr-4 text-base shadow-sm",
              isDark
                ? "border-white/15 bg-white/10 text-white placeholder:text-white/50"
                : "border-primary-100 bg-white",
            )}
            aria-label={t("searchAria")}
          />
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="submit"
            className={cn(
              "h-11 rounded-xl px-6",
              isDark
                ? "bg-[#D4AF37] text-[#0B1E3F] hover:bg-[#c4a030]"
                : "bg-primary-950 text-white hover:bg-primary-900",
            )}
          >
            {t("searchButton")}
          </Button>

          {hasQuery ? (
            <Button
              type="button"
              variant="outline"
              className={cn(
                "h-11 rounded-xl",
                isDark
                  ? "border-white/20 bg-transparent text-white hover:bg-white/10"
                  : "border-primary-100",
              )}
              asChild
            >
              <Link
                href={buildKurslarUrl({ categorySlug })}
                aria-label={t("clearSearchAria")}
              >
                <X className="h-4 w-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
