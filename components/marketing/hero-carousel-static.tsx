import { HeroCourseSlide } from "@/components/marketing/hero-course-slide";
import {
  HeroCarouselControlsPlaceholder,
  HeroCarouselHeading,
  HeroCarouselShell,
} from "@/components/marketing/hero-carousel-shell";
import type { Course } from "@/types/wordpress";

interface HeroCarouselStaticProps {
  course: Course;
  slideCount: number;
}

/** İlk slayt — sunucu tarafında anında HTML; JS gelene kadar görünür kalır. */
export function HeroCarouselStatic({ course, slideCount }: HeroCarouselStaticProps) {
  return (
    <div data-hero-carousel-static className="w-full">
      <HeroCarouselHeading />
      <HeroCarouselShell>
        <HeroCourseSlide course={course} priority />
      </HeroCarouselShell>
      <HeroCarouselControlsPlaceholder slideCount={slideCount} />
    </div>
  );
}
