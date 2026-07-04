import { Container } from "@/components/layout/container";
import { HeroMarketingCopy } from "@/components/marketing/hero-marketing-copy";
import { HeroRoadmapPreview } from "@/components/marketing/hero-roadmap-preview";
import { SignupDiscountBadge } from "@/components/marketing/signup-discount-badge";

export function Hero() {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-12 sm:py-16 md:py-20 lg:py-24"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl md:-right-8 md:h-96 md:w-96" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
      </div>

      <Container size="wide" className="relative">
        <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-[1.05fr_1fr] xl:gap-10">
          <HeroMarketingCopy />

          <div className="order-1 xl:order-2">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_12.5rem]">
              <div className="relative min-w-0">
                <HeroRoadmapPreview />
              </div>
              <div className="mx-auto w-full max-w-xs lg:mx-0 lg:max-w-none lg:pt-8">
                <SignupDiscountBadge />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
