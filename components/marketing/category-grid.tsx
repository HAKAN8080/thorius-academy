import Link from "next/link";
import {
  BarChart3,
  Brain,
  ShoppingBag,
  Store,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Container } from "@/components/layout/container";
import { Card, CardContent } from "@/components/ui/card";
import type { WPCategory } from "@/types/wordpress";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, LucideIcon> = {
  "planlama-otb": BarChart3,
  "ai-veri": Brain,
  liderlik: Users,
  operasyon: Store,
  pazarlama: Target,
  "e-ticaret": ShoppingBag,
};

const defaultIcon = BarChart3;

interface CategoryGridProps {
  categories: WPCategory[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-16" aria-labelledby="categories-heading">
      <Container>
        <h2
          id="categories-heading"
          className="text-center text-3xl font-bold text-primary-900"
        >
          Uzmanlık Alanları
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-primary-700">
          Perakende yöneticileri için kariyerinizi hızlandıracak programlar
        </p>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const Icon = categoryIcons[category.slug] ?? defaultIcon;

            return (
              <Link
                key={category.id}
                href={`/kurslar?kategori=${category.slug}`}
                className="group"
              >
                <Card
                  className={cn(
                    "h-full border-primary-100 transition-all duration-300",
                    "hover:-translate-y-1 hover:border-accent-500/40 hover:shadow-lg"
                  )}
                >
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700 transition-colors group-hover:bg-accent-100 group-hover:text-accent-900">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary-900">
                        {category.name}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {category.count} kurs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
