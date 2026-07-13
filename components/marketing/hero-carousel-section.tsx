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
    <div className="mx-auto w-full min-w-0 max-w-[22rem] -mt-1 sm:max-w-md lg:-mt-2 lg:mx-0 lg:max-w-[26rem] xl:max-w-md">
      <HeroCarouselHydrated
        courses={courses}
        heading={heading}
        ariaLabel={ariaLabel}
      />
    </div>
  );
}
