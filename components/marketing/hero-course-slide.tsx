"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Course } from "@/types/wordpress";

interface HeroCourseSlideProps {
  course: Course;
  /** İlk slayt LCP için — fetchPriority high + eager load */
  priority?: boolean;
}

export function HeroCourseSlide({ course, priority = false }: HeroCourseSlideProps) {
  const t = useTranslations("hero");

  return (
    <Link
      href={`/kurslar/${course.slug}`}
      className="block h-full"
      tabIndex={priority ? 0 : -1}
    >
      <Card className="group h-full overflow-hidden rounded-none border-0 bg-white shadow-none transition-shadow hover:shadow-none">
        <div className="relative flex aspect-[16/5] flex-col justify-end overflow-hidden bg-primary-950 p-3 sm:p-3.5">
          {course.featuredImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={course.featuredImage}
              alt={course.imageAlt || course.title}
              fetchPriority={priority ? "high" : "auto"}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          <div
            className="absolute inset-0 bg-gradient-to-t from-primary-950/95 via-primary-950/40 to-primary-950/10"
            aria-hidden="true"
          />
          {course.categories.length > 0 ? (
            <Badge className="relative z-10 mb-auto w-fit bg-accent-500/90 text-primary-950 hover:bg-accent-500">
              {course.categories[0].name}
            </Badge>
          ) : null}
          <p className="relative z-10 text-[10px] font-medium uppercase tracking-wider text-accent-400 sm:text-xs">
            {t("carouselFeatured")}
          </p>
          <h3 className="relative z-10 mt-0.5 line-clamp-2 text-base font-bold text-white md:text-lg">
            {course.title}
          </h3>
          <p className="relative z-10 mt-1 text-xs font-medium text-accent-300/90 group-hover:underline sm:text-sm">
            {t("carouselView")}
          </p>
        </div>
      </Card>
    </Link>
  );
}
