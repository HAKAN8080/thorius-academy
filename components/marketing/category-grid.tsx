import Link from "next/link";
import { Container } from "@/components/layout/container";
import { Card } from "@/components/ui/card";
import { buildKurslarUrl } from "@/lib/course/kurslar-url";
import { catalogSlugFromWordPressCategory } from "@/lib/course/category-slug";
import type { WPCategory } from "@/types/wordpress";
import { cn } from "@/lib/utils";

interface CategoryGridProps {
  categories: WPCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      className="border-b border-primary-100 bg-white py-4 md:py-5"
      aria-labelledby="categories-heading"
    >
      <Container size="wide">
        <h2
          id="categories-heading"
          className="mb-3 text-xl font-bold text-primary-900 md:mb-4 md:text-2xl"
        >
          Uzmanlık Alanları
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
          {categories.map((category) => (
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
                  "hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-lg",
                )}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-primary-100">
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
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-950/70 via-primary-950/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <p className="mt-1 text-sm text-primary-100">
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
