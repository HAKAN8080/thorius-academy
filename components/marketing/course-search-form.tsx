import Link from "next/link";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";

interface CourseSearchFormProps {
  defaultQuery?: string;
  categorySlug?: string;
}

export function CourseSearchForm({
  defaultQuery,
  categorySlug,
}: CourseSearchFormProps) {
  const hasQuery = Boolean(defaultQuery?.trim());

  return (
    <form action="/kurslar" method="get" className="w-full">
      {categorySlug ? (
        <input type="hidden" name="kategori" value={categorySlug} />
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            name="ara"
            defaultValue={defaultQuery ?? ""}
            placeholder="Kurs adı veya konu ara..."
            className="h-11 rounded-xl border-primary-100 bg-white pl-10 pr-4 text-base shadow-sm"
            aria-label="Kurs ara"
          />
        </div>

        <div className="flex shrink-0 gap-2">
          <Button
            type="submit"
            className="h-11 rounded-xl bg-primary-950 px-6 text-white hover:bg-primary-900"
          >
            Ara
          </Button>

          {hasQuery ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-primary-100"
              asChild
            >
              <Link
                href={buildKurslarUrl({ categorySlug })}
                aria-label="Aramayı temizle"
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
