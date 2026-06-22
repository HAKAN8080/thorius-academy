"use client";

import { useEffect, useState } from "react";
import { HeroCarouselLoading } from "@/components/marketing/hero-carousel-loading";
import { HeroCourseCarouselInner } from "@/components/marketing/hero-course-carousel-inner";
import type { Course } from "@/types/wordpress";

interface HeroCarouselHydratedProps {
  courses: Course[];
}

/** İlk paint: gerçek kurs slaytı (SSR). Hydration sonrası tam carousel. */
export function HeroCarouselHydrated({ courses }: HeroCarouselHydratedProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <HeroCarouselLoading
        slideCount={courses.length}
        firstCourse={courses[0]}
      />
    );
  }

  return <HeroCourseCarouselInner courses={courses} />;
}
