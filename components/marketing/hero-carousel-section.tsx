import dynamic from "next/dynamic";
import { HeroCarouselLoading } from "@/components/marketing/hero-carousel-loading";
import type { Course } from "@/types/wordpress";

const HeroCourseCarouselClient = dynamic(
  () =>
    import("@/components/marketing/hero-course-carousel.client").then(
      (mod) => mod.HeroCourseCarouselClient,
    ),
  {
    ssr: false,
    loading: () => <HeroCarouselLoading />,
  },
);

interface HeroCarouselSectionProps {
  courses: Course[];
}

export function HeroCarouselSection({ courses }: HeroCarouselSectionProps) {
  if (courses.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <HeroCourseCarouselClient courses={courses} />
    </div>
  );
}
