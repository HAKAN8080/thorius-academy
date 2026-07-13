import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { HeroCarouselSection } from "@/components/marketing/hero-carousel-section";
import { HeroMarketingCopy } from "@/components/marketing/hero-marketing-copy";
import { HeroRetailBackground } from "@/components/marketing/hero-retail-background";
import type { Course } from "@/types/wordpress";

interface HeroProps {
  carouselCourses: Course[];
}

export async function Hero({ carouselCourses }: HeroProps) {
  const t = await getTranslations("hero");

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#14081f] via-[#2a1548] to-[#1a0b2e] py-6 sm:py-8 md:py-10 lg:py-12"
      aria-labelledby="hero-heading"
    >
      <HeroRetailBackground />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-accent-500/20 blur-3xl md:-right-8 md:h-48 md:w-48" />
        <div className="absolute -left-24 bottom-0 h-36 w-36 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-32 w-32 -translate-x-1/2 rounded-full bg-fuchsia-400/10 blur-[100px]" />
      </div>

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 lg:gap-6 xl:gap-8">
          <HeroMarketingCopy />

          {carouselCourses.length > 0 ? (
            <div className="w-full min-w-0">
              <HeroCarouselSection
                courses={carouselCourses}
                ariaLabel={t("popularCoursesAria")}
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
