import Link from "next/link";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
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
  totalCount: number;
  searchQuery?: string;
  variant?: "light" | "dark";
}

export function CategoryFilter({
  categories,
  selectedSlug,
  totalCount,
  searchQuery,
  variant = "light",
}: CategoryFilterProps) {
  const isDark = variant === "dark";

  return (
    <div className="space-y-1">
      <h3
        className={cn(
          "mb-3 text-xs font-semibold uppercase tracking-wider",
          isDark ? "text-[#D4AF37]" : "text-muted-foreground",
        )}
      >
        Kategoriler
      </h3>

      <Link
        href={buildKurslarUrl({ search: searchQuery })}
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
        Tümü ({totalCount})
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildKurslarUrl({
            categorySlug: cat.slug,
            search: searchQuery,
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
