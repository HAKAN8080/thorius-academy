import { HeroCarouselHydrated } from "@/components/marketing/hero-carousel-hydrated";
import type { Course } from "@/types/wordpress";

interface HeroCarouselSectionProps {
  courses: Course[];
}

export function HeroCarouselSection({ courses }: HeroCarouselSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <HeroCarouselHydrated courses={courses} />
    </div>
  );
}
