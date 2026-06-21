import {
  HeroCarouselControlsPlaceholder,
  HeroCarouselHeading,
  HeroCarouselShell,
} from "@/components/marketing/hero-carousel-shell";

/** JS yüklenirken tek Mac mockup — gerçek kurs içeriği yok, çift pencere oluşmaz. */
export function HeroCarouselLoading({ slideCount = 5 }: { slideCount?: number }) {
  return (
    <div className="w-full" aria-busy="true" aria-label="Kurs carousel yükleniyor">
      <HeroCarouselHeading />
      <HeroCarouselShell>
        <div className="aspect-[16/10] w-full animate-pulse bg-primary-900/80" />
      </HeroCarouselShell>
      <HeroCarouselControlsPlaceholder slideCount={slideCount} />
    </div>
  );
}
