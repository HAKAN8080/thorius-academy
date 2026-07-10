import { HeroCarouselHydrated } from "@/components/marketing/hero-carousel-hydrated";
import type { Course } from "@/types/wordpress";

interface HeroCarouselSectionProps {
  courses: Course[];
  heading?: string;
  ariaLabel?: string;
}

export function HeroCarouselSection({
  courses,
  heading,
  ariaLabel = "Öne çıkan kurslar",
}: HeroCarouselSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto w-[80%] min-w-0 -mt-2 lg:-mt-8 lg:ml-auto lg:mr-0">
      <HeroCarouselHydrated
        courses={courses}
        heading={heading}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
