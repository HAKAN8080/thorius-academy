import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { CategoryFilter } from "@/components/marketing/category-filter";
import { CourseCard } from "@/components/marketing/course-card";
import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { getCourseStatsMap } from "@/lib/actions/course-stats";
import { fetchAllCategories, fetchAllCourses } from "@/lib/wordpress/api";
import type { CourseProduct } from "@/types/course-product";

export const metadata: Metadata = {
  title: "Tüm Kurslar",
  description:
    "Perakende, AI, liderlik ve daha fazlası. Thorius Academy'nin premium kurs kataloğu.",
};

export const revalidate = 3600;

interface KurslarPageProps {
  searchParams: { kategori?: string };
}

async function KurslarContent({
  selectedCategory,
}: {
  selectedCategory?: string;
}) {
  const courses = await fetchAllCourses();
  const [categories, products, statsBySlug] = await Promise.all([
    fetchAllCategories(courses),
    getAllCourseProducts(),
    getCourseStatsMap(courses),
  ]);

  const productBySlug = new Map<string, CourseProduct>(
    products.map((p) => [p.course_slug, p]),
  );

  const filteredCourses = selectedCategory
    ? courses.filter((c) =>
        c.categories.some((cat) => cat.slug === selectedCategory)
      )
    : courses;

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
              const stats = statsBySlug.get(course.slug);
              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  product={productBySlug.get(course.slug) ?? null}
                  lessonCount={stats?.lessonCount}
                  duration={stats?.durationLabel}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function KurslarPage({ searchParams }: KurslarPageProps) {
  const selectedCategory = searchParams.kategori;

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-8 md:mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          Tüm Kurslar
        </h1>
        <p className="text-lg text-muted-foreground">
          Perakende profesyonelleri için seçilmiş eğitim programları
        </p>
      </div>

      <Suspense fallback={<CourseGridSkeleton count={6} />}>
        <KurslarContent selectedCategory={selectedCategory} />
      </Suspense>
    </Container>
  );
}
