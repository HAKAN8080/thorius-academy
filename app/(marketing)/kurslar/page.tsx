import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CourseCard } from "@/components/marketing/course-card";
import { categoryLabels, courses } from "@/lib/data/courses";
import type { CourseCategory } from "@/types/database";
import { cn } from "@/lib/utils";

interface KurslarPageProps {
  searchParams: { kategori?: string; kurs?: string };
}

const allCategories = Object.keys(categoryLabels) as CourseCategory[];

export default function KurslarPage({ searchParams }: KurslarPageProps) {
  const activeCategory = searchParams.kategori as CourseCategory | undefined;
  const filtered = activeCategory
    ? courses.filter((c) => c.category === activeCategory)
    : courses;

  return (
    <Container className="py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-primary-900">Kurslar</h1>
        <p className="mt-2 text-primary-700">
          Perakende profesyonelleri için seçilmiş eğitim programları
        </p>
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        <aside className="lg:w-64" aria-label="Kategori filtresi">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-primary-600">
            Kategoriler
          </h2>
          <ul className="space-y-1">
            <li>
              <Link
                href="/kurslar"
                className={cn(
                  "block rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                  !activeCategory
                    ? "bg-primary-900 text-white"
                    : "text-primary-700 hover:bg-primary-50"
                )}
              >
                Tümü ({courses.length})
              </Link>
            </li>
            {allCategories.map((cat) => {
              const count = courses.filter((c) => c.category === cat).length;
              return (
                <li key={cat}>
                  <Link
                    href={`/kurslar?kategori=${cat}`}
                    className={cn(
                      "block rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                      activeCategory === cat
                        ? "bg-primary-900 text-white"
                        : "text-primary-700 hover:bg-primary-50"
                    )}
                  >
                    {categoryLabels[cat]} ({count})
                  </Link>
                </li>
              );
            })}
          </ul>
        </aside>

        <div className="flex-1">
          {filtered.length === 0 ? (
            <p className="text-primary-600">Bu kategoride henüz kurs bulunmuyor.</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
