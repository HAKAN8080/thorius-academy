import Link from "next/link";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import type { WPCategory } from "@/types/wordpress";
import { cn } from "@/lib/utils";

interface CategoryFilterProps {
  categories: WPCategory[];
  selectedSlug?: string;
  totalCount: number;
}

export function CategoryFilter({
  categories,
  selectedSlug,
  totalCount,
}: CategoryFilterProps) {
  return (
    <div className="space-y-1">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Kategoriler
      </h3>

      <Link
        href={buildKurslarUrl()}
        className={cn(
          "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
          !selectedSlug
            ? "bg-primary-950 text-white"
            : "text-primary-900 hover:bg-primary-50"
        )}
      >
        Tümü ({totalCount})
      </Link>

      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={buildKurslarUrl({ categorySlug: cat.slug })}
          className={cn(
            "block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
            selectedSlug === cat.slug
              ? "bg-primary-950 text-white"
              : "text-primary-900 hover:bg-primary-50"
          )}
        >
          {cat.name} ({cat.count})
        </Link>
      ))}
    </div>
  );
}
