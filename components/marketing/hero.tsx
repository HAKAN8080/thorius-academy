import { Container } from "@/components/layout/container";
import { HeroCarouselSection } from "@/components/marketing/hero-carousel-section";
import { HeroMarketingCopy } from "@/components/marketing/hero-marketing-copy";
import { HeroNeonTagline } from "@/components/marketing/hero-neon-tagline";
import { HeroRetailBackground } from "@/components/marketing/hero-retail-background";
import type { Course } from "@/types/wordpress";

interface HeroProps {
  pathCourses: Course[];
}

export function Hero({ pathCourses }: HeroProps) {
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
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[1.05fr_1fr] xl:gap-10">
          <HeroMarketingCopy />

          <div className="order-1 xl:order-2">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_14.5rem]">
              <div className="relative min-w-0">
                <HeroCarouselSection
                  courses={pathCourses}
                  heading="Retail Planning · Kariyer Yolu"
                  ariaLabel="Retail Planning kariyer yolu kursları"
                />
              </div>
              <div className="mx-auto w-full max-w-[17rem] sm:max-w-xs lg:mx-0 lg:max-w-none lg:pt-8">
                <HeroNeonTagline />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
