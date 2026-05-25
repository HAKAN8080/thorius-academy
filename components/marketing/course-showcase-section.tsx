import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CourseCard } from "@/components/marketing/course-card";
import { cn } from "@/lib/utils";
import type { CourseProduct } from "@/types/course-product";
import type { Course } from "@/types/wordpress";

interface CourseShowcaseSectionProps {
  id: string;
  title: string;
  description: string;
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
          <h2
            id={id}
            className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl"
          >
            {title}
          </h2>
          <p className="text-lg text-muted-foreground">{description}</p>
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
            className="inline-flex items-center gap-2 font-semibold text-primary-950 transition-colors hover:text-accent-600"
          >
            {viewAllLabel}
          </Link>
        </div>
      </Container>
    </section>
  );
}
