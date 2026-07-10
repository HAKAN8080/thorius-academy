"use client";

import { useEffect, useState } from "react";
import { HeroCarouselLoading } from "@/components/marketing/hero-carousel-loading";
import { HeroCourseCarouselInner } from "@/components/marketing/hero-course-carousel-inner";
import type { Course } from "@/types/wordpress";

interface HeroCarouselHydratedProps {
  courses: Course[];
  heading?: string;
  ariaLabel?: string;
}

/** İlk paint: gerçek kurs slaytı (SSR). Hydration sonrası tam carousel. */
export function HeroCarouselHydrated({
  courses,
  heading,
  ariaLabel = "Öne çıkan kurslar",
}: HeroCarouselHydratedProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <HeroCarouselLoading
        slideCount={courses.length}
        firstCourse={courses[0]}
        heading={heading}
      />
    );
  }

  return (
    <HeroCourseCarouselInner
      courses={courses}
      heading={heading}
      ariaLabel={ariaLabel}
    />
  );
}
