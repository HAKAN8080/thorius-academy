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
  compact?: boolean;
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
  compact = false,
}: CourseShowcaseSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <section
      className={cn(compact ? "py-8 md:py-10" : "py-14 md:py-20", className)}
      aria-labelledby={id}
    >
      <Container size="wide">
        <div className={cn("text-center", compact ? "mb-6" : "mb-10")}>
          <span
            className="mx-auto mb-4 block h-1 w-12 rounded-full bg-gradient-to-r from-accent-400 to-accent-600"
            aria-hidden="true"
          />
          <h2
            id={id}
            className={cn(
              "font-bold tracking-tight text-primary-950",
              compact ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl",
              description ? "mb-3" : "mb-0",
            )}
          >
            {title}
          </h2>
          {description ? (
            <p
              className={cn(
                "mx-auto max-w-2xl text-muted-foreground",
                compact ? "text-base" : "text-lg",
              )}
            >
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

        <div className={cn("text-center", compact ? "mt-6" : "mt-10")}>
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
