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
    <div className="relative w-full" data-hero-carousel>
      <HeroCarouselStatic course={firstCourse} slideCount={courses.length} />
      <div className="absolute inset-x-0 top-0">
        <Suspense fallback={null}>
          <HeroCourseCarouselClient courses={courses} />
        </Suspense>
      </div>
    </div>
  );
}
