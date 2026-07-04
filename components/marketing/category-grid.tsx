import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import { catalogSlugFromWordPressCategory } from "@/lib/course/category-slug";
import { sortHomepageCategories } from "@/lib/course/sort-homepage-categories";
import type { WPCategory } from "@/types/wordpress";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: WPCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  const visibleCategories = sortHomepageCategories(categories).slice(0, 10);

  if (visibleCategories.length === 0) {
    return null;
  }

  return (
    <section
      className="border-b border-primary-100 bg-white py-4 md:py-5"
      aria-label="Kurs kategorileri"
    >
      <Container size="wide">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 lg:grid-cols-10 lg:gap-2.5">
          {visibleCategories.map((category) => (
            <Link
              key={category.id}
              href={buildKurslarUrl({
                categorySlug: catalogSlugFromWordPressCategory(category),
              })}
              className="group"
            >
              <Card
                className={cn(
                  "h-full overflow-hidden border-primary-100 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-accent-500/40 hover:shadow-md",
                )}
              >
                <div className="relative aspect-[5/3] overflow-hidden bg-primary-100 lg:aspect-[4/3]">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={`${category.name} kategorisi`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/75 via-primary-950/15 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 lg:p-1.5">
                    <h3 className="line-clamp-2 text-[11px] font-semibold leading-tight text-white sm:text-xs lg:text-[10px] lg:leading-snug xl:text-[11px]">
                      {category.name}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-primary-100 sm:text-xs lg:text-[9px] xl:text-[10px]">
                      {category.count} kurs
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
