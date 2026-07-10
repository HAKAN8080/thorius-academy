import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { CourseCard } from "@/components/marketing/course-card";
import { cn } from "@/lib/utils";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";

interface CourseShowcaseSectionProps {
  id: string;
  title: string;
  description?: string;
  courses: Course[];
  productBySlug: Map<string, CourseProduct>;
  statsBySlug: Map<
    string,
    { lessonCount?: number; durationLabel?: string } | undefined
  >;
  viewAllHref: string;
  viewAllLabel?: string;
  className?: string;
}

export function CourseShowcaseSection({
  id,
  title,
  description,
  courses,
  productBySlug,
  statsBySlug,
  viewAllHref,
  viewAllLabel = "Tümünü Görüntüle →",
  className,
}: CourseShowcaseSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section
      className={cn("py-14 md:py-20", className)}
      aria-labelledby={id}
    >
      <Container size="wide">
        <div className="mb-10 text-center">
          <span
            className="mx-auto mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent-400 to-accent-600"
            aria-hidden="true"
          />
          <h2
            id={id}
            className={cn(
              "text-3xl font-bold tracking-tight text-primary-950 md:text-4xl",
              description ? "mb-3" : "mb-0",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-4 xl:gap-5">
          {courses.map((course) => {
            const stats = statsBySlug.get(course.slug);
            return (
              <CourseCard
                key={course.id}
                course={course}
                product={productBySlug.get(course.slug) ?? null}
                lessonCount={stats?.lessonCount}
                duration={stats?.durationLabel}
                size="compact"
              />
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-6 py-2.5 text-sm font-semibold text-primary-950 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent-500/60 hover:shadow-md"
          >
            {viewAllLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}
