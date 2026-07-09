import Link from "next/link";
import { Building2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FeaturedCourseSpotlightSection } from "@/components/marketing/featured-course-spotlight-section";
import { Hero } from "@/components/marketing/hero";
import { EcosystemCards } from "@/components/marketing/ecosystem-cards";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { CourseShowcaseSection } from "@/components/marketing/course-showcase-section";
import { InspirationBanner } from "@/components/marketing/inspiration-banner";
import { Button } from "@/components/ui/button";
import { canonicalizeCategorySlug } from "@/lib/course/category-slug";
import { loadCareerPathBySlug } from "@/lib/course/load-career-path-by-slug";
import { pickCareerPathCourses } from "@/lib/course/pick-career-path-courses";
import {
  filterCoursesByCategorySlugs,
  filterPurchasableCourses,
  pickCoursesByCategorySlugs,
  pickFeaturedCoursesByCategory,
  pickPaidCoursesExcludingCategories,
} from "@/lib/course/pick-featured-courses";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";
import { getHomepageCatalog } from "@/lib/wordpress/homepage-data";
import type { CourseProduct } from "@/types/course-product";

const FEATURED_CATEGORY_SLUGS = ["planlama", "insan-kaynaklari"] as const;
const HR_CATEGORY_SLUGS = ["insan-kaynaklari", "yoga"] as const;
const PLANNING_CATEGORY_SLUGS = ["planlama", "ai"] as const;
const OTHER_PAID_EXCLUDED_SLUGS = [
  ...HR_CATEGORY_SLUGS,
  "planlama",
] as const;
const OTHER_PAID_PRIORITY_SLUGS = [
  "yapay-zeka",
  "ai",
  "tedarik-zinciri",
  "kocluk",
] as const;

export async function AcademyHomePage() {
  const [{ courses: allCourses, categories, products, stats }, retailPath] =
    await Promise.all([
      getHomepageCatalog(),
      loadCareerPathBySlug("retail-planning", RETAIL_PLANNING_PATH),
    ]);

  const productBySlug = new Map<string, CourseProduct>(
    products.map((p) => [p.course_slug, p]),
  );
  const statsBySlug = new Map(Object.entries(stats));

  const featuredCategorySlugs = new Set(
    FEATURED_CATEGORY_SLUGS.map(canonicalizeCategorySlug),
  );
  const featuredCategories = categories.filter((category) =>
    featuredCategorySlugs.has(canonicalizeCategorySlug(category.slug)),
  );
  const featuredCourses = pickFeaturedCoursesByCategory(
    filterCoursesByCategorySlugs(
      filterPurchasableCourses(allCourses, productBySlug),
      [...FEATURED_CATEGORY_SLUGS],
    ),
    featuredCategories,
    5,
  );
  const planningCourses = pickCoursesByCategorySlugs(
    allCourses,
    [...PLANNING_CATEGORY_SLUGS],
    5,
  );
  const otherPaidCourses = pickPaidCoursesExcludingCategories(
    allCourses,
    productBySlug,
    [...OTHER_PAID_EXCLUDED_SLUGS],
    [...OTHER_PAID_PRIORITY_SLUGS],
    5,
  );
  const hrCourses = pickCoursesByCategorySlugs(
    allCourses,
    [...HR_CATEGORY_SLUGS],
    5,
  );
  const retailPlanningSteps =
    retailPath?.path.steps ?? RETAIL_PLANNING_PATH.steps;
  const retailPlanningCourses = pickCareerPathCourses(
    allCourses,
    retailPlanningSteps,
  );

  return (
    <>
      <CategoryGrid categories={categories} />
      <FeaturedCourseSpotlightSection />
      <Hero pathCourses={retailPlanningCourses} />
      <EcosystemCards />

      <CourseShowcaseSection
        id="featured-heading"
        title="Öne Çıkan Kurslar"
        description="Profesyoneller için seçilmiş premium eğitimler"
        courses={featuredCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar"
        viewAllLabel="Tüm Kursları Görüntüle →"
        className="bg-gradient-to-b from-white to-primary-50"
      />

      <CourseShowcaseSection
        id="planning-heading"
        title="Planlama Kursları"
        description="Perakende planlama, bütçe ve talep yönetimi eğitimleri"
        courses={planningCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar?kategori=planlama"
      />

      <CourseShowcaseSection
        id="hr-heading"
        title="İK Kursları"
        description="İnsan kaynakları, yetenek yönetimi ve organizasyonel gelişim"
        courses={hrCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar?kategori=insan-kaynaklari"
        className="bg-primary-50"
      />

      <CourseShowcaseSection
        id="other-paid-heading"
        title="Diğer Eğitimler"
        description="Planlama ve İK dışındaki ücretli uzmanlık programları"
        courses={otherPaidCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar"
      />

      <InspirationBanner compact />

      <section
        className="border-y border-primary-100 bg-primary-900 py-16 text-white"
        aria-labelledby="b2b-heading"
      >
        <Container
          size="wide"
          className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left"
        >
          <div className="flex max-w-2xl flex-col items-center gap-4 lg:items-start">
            <Building2 className="h-12 w-12 text-accent-500" aria-hidden="true" />
            <h2 id="b2b-heading" className="text-2xl font-bold sm:text-3xl">
              Şirketinize özel eğitim çözümleri
            </h2>
            <p className="text-primary-100">
              50+ mağazalı perakende zincirleri için özelleştirilmiş öğrenme
              yolları, canlı atölyeler ve performans raporlama.
            </p>
          </div>
          <Button variant="gold" size="lg" asChild>
            <Link href="/kurumsal">Kurumsal Teklif Alın</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
