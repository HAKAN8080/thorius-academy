import {
  HeroCarouselControlsPlaceholder,
  HeroCarouselHeading,
  HeroCarouselShell,
} from "@/components/marketing/hero-carousel-shell";
import { HeroCourseSlide } from "@/components/marketing/hero-course-slide";
import type { Course } from "@/types/wordpress";

/** JS yüklenirken ilk kurs slaytı (LCP) veya pulse fallback. */
export function HeroCarouselLoading({
  slideCount = 5,
  firstCourse,
  heading,
}: {
  slideCount?: number;
  firstCourse?: Course;
  heading?: string;
}) {
  return (
    <div className="w-full" aria-busy="true" aria-label="Kurs carousel yükleniyor">
      {heading ? <HeroCarouselHeading title={heading} /> : null}
      <HeroCarouselShell>
        {firstCourse ? (
          <HeroCourseSlide course={firstCourse} priority />
        ) : (
          <div className="aspect-video w-full animate-pulse bg-primary-900/80" />
        )}
      </HeroCarouselShell>
      <HeroCarouselControlsPlaceholder slideCount={slideCount} />
    </div>
  );
}
