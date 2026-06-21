import dynamic from "next/dynamic";
import { HeroCarouselStatic } from "@/components/marketing/hero-carousel-static";
import type { Course } from "@/types/wordpress";

const HeroCourseCarouselClient = dynamic(
  () =>
    import("@/components/marketing/hero-course-carousel.client").then(
      (mod) => mod.HeroCourseCarouselClient,
    ),
  { ssr: false },
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
    <div className="w-full" data-hero-carousel>
      <HeroCarouselStatic course={firstCourse} slideCount={courses.length} />
      <HeroCourseCarouselClient courses={courses} />
    </div>
  );
}
