import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { FeaturedCourseSpotlightCarousel } from "@/components/marketing/featured-course-spotlight-carousel";
import { HeroMarketingCopy } from "@/components/marketing/hero-marketing-copy";
import { HeroRetailBackground } from "@/components/marketing/hero-retail-background";
import type { FeaturedCourseSpotlight } from "@/types/featured-course-spotlight";

interface HeroProps {
  spotlightCourses: FeaturedCourseSpotlight[];
}

export async function Hero({ spotlightCourses }: HeroProps) {
  const t = await getTranslations("hero");

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-[#060b18] via-primary-950 to-[#0a1228] py-12 sm:py-16 md:py-20 lg:py-24"
      aria-labelledby="hero-heading"
    >
      <HeroRetailBackground />

      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent-500/25 blur-3xl md:-right-8 md:h-96 md:w-96" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-accent-400/10 blur-[100px]" />
      </div>

      <Container size="wide" className="relative z-10">
        <div className="grid grid-cols-1 items-start gap-10 xl:grid-cols-[minmax(0,0.95fr)_1.05fr] xl:gap-12">
          <HeroMarketingCopy />

          {spotlightCourses.length > 0 ? (
            <div className="order-2 min-w-0 overflow-hidden xl:order-2 xl:pl-2">
              <h2 className="mb-5 text-xl font-bold tracking-tight text-white sm:mb-6 sm:text-2xl">
                {t("popularCourses")}
              </h2>
              <FeaturedCourseSpotlightCarousel
                courses={spotlightCourses}
                variant="hero"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
