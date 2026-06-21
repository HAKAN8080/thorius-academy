import { Suspense } from "react";
import { CategoryGridSkeleton } from "@/components/marketing/category-grid-skeleton";
import { HeroSkeleton } from "@/components/marketing/hero-skeleton";
import { HomeCategorySection } from "@/components/marketing/home-category-section";
import { HomeHeroSection } from "@/components/marketing/home-hero-section";
import { HomeShowcaseSections } from "@/components/marketing/home-showcase-sections";

export async function AcademyHomePage() {
  return (
    <>
      <Suspense fallback={<CategoryGridSkeleton />}>
        <HomeCategorySection />
      </Suspense>

      <Suspense fallback={<HeroSkeleton />}>
        <HomeHeroSection />
      </Suspense>

      <Suspense fallback={null}>
        <HomeShowcaseSections />
      </Suspense>
    </>
  );
}
