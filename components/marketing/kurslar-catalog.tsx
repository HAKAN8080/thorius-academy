"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CategoryFilter } from "@/components/marketing/category-filter";
import { CourseCard } from "@/components/marketing/course-card";
import type { CourseStats } from "@/lib/actions/course-stats";
import type { CourseProduct } from "@/types/course-product";
import type { Course, WPCategory } from "@/types/wordpress";

interface KurslarCatalogProps {
  courses: Course[];
  categories: WPCategory[];
  products: CourseProduct[];
  stats: Record<string, CourseStats>;
}

export function KurslarCatalog({
  courses,
  categories,
  products,
  stats,
}: KurslarCatalogProps) {
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("kategori") ?? undefined;

  const productBySlug = useMemo(
    () => new Map(products.map((product) => [product.course_slug, product])),
    [products],
  );

  const filteredCourses = useMemo(() => {
    if (!selectedCategory) {
      return courses;
    }

    return courses.filter((course) =>
      course.categories.some((category) => category.slug === selectedCategory),
    );
  }, [courses, selectedCategory]);

  if (courses.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-muted-foreground">Henüz kurs yok.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside aria-label="Kategori filtresi">
        <CategoryFilter
          categories={categories}
          selectedSlug={selectedCategory}
          totalCount={courses.length}
        />
      </aside>

      <div>
        {filteredCourses.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">
              Bu kategoride henüz kurs bulunmuyor.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCourses.map((course) => {
              const courseStats = stats[course.slug];
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  product={productBySlug.get(course.slug) ?? null}
                  lessonCount={courseStats?.lessonCount}
                  duration={courseStats?.durationLabel}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
