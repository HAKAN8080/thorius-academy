import { Suspense } from "react";
import dynamic from "next/dynamic";
import { HeroCarouselStatic } from "@/components/marketing/hero-carousel-static";
import type { Course } from "@/types/wordpress";

const HeroCourseCarouselClient = dynamic(
  () =>
    import("@/components/marketing/hero-course-carousel.client").then(
      (mod) => mod.HeroCourseCarouselClient,
    ),
  { ssr: false, loading: () => null },
);

interface HeroCarouselSectionProps {
  courses: Course[];
}

export function HeroCarouselSection({ courses }: HeroCarouselSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  const firstCourse = courses[0];

  return (
    <div
      className="relative w-full min-h-[22rem] sm:min-h-[24rem]"
      data-hero-carousel
    >
      <div className="grid [grid-template-areas:'stack']">
        <div className="[grid-area:stack]" data-hero-carousel-static>
          <HeroCarouselStatic course={firstCourse} slideCount={courses.length} />
        </div>
        <div className="pointer-events-none invisible [grid-area:stack] data-[ready=true]:pointer-events-auto data-[ready=true]:visible">
          <Suspense fallback={null}>
            <HeroCourseCarouselClient courses={courses} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
