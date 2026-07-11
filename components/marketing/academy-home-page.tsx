import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Building2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { FreeCoursesHubSection } from "@/components/marketing/free-courses-hub-section";
import { Hero } from "@/components/marketing/hero";
import { AcademyStatsSection } from "@/components/marketing/academy-stats-section";
import { MemberPromoSection } from "@/components/marketing/member-promo-section";
import { EcosystemCards } from "@/components/marketing/ecosystem-cards";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { CourseShowcaseSection } from "@/components/marketing/course-showcase-section";
import { AcademyKitaplikPromoSection } from "@/components/marketing/academy-kitaplik-promo-section";
import { InspirationBanner } from "@/components/marketing/inspiration-banner";
import { Button } from "@/components/ui/button";
import { canonicalizeCategorySlug } from "@/lib/course/category-slug";
import { pickHomepageSpotlightCourses } from "@/lib/course/homepage-spotlight-courses";
import {
  filterCoursesByCategorySlugs,
  filterPurchasableCourses,
  pickCoursesByCategorySlugs,
  pickFeaturedCoursesByCategory,
  pickPaidCoursesExcludingCategories,
} from "@/lib/course/pick-featured-courses";
import {
  getHomepageCatalog,
  getRecentlyAddedHomepageCourses,
} from "@/lib/wordpress/homepage-data";
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
  const t = await getTranslations("home");
  const locale = await getLocale();
  const appLocale = locale === "en" ? "en" : "tr";
  const [{ courses: allCourses, categories, products, stats }, recentCourses] =
    await Promise.all([
      getHomepageCatalog(appLocale),
      getRecentlyAddedHomepageCourses(appLocale),
    ]);

  const carouselCourses = pickHomepageSpotlightCourses(allCourses);

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

  return (
    <>
      <AcademyStatsSection />
      <CategoryGrid categories={categories} />
      <Hero carouselCourses={carouselCourses} />

      <CourseShowcaseSection
        id="recent-heading"
        title={t("showcases.recent.title")}
        description={t("showcases.recent.description")}
        courses={recentCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar"
        viewAllLabel={t("showcases.viewAllCourses")}
        compact
        className="bg-gradient-to-b from-primary-50 to-white"
      />

      <MemberPromoSection />
      <EcosystemCards />

      <CourseShowcaseSection
        id="featured-heading"
        title={t("showcases.featured.title")}
        description={t("showcases.featured.description")}
        courses={featuredCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar"
        viewAllLabel={t("showcases.viewAllCourses")}
        className="bg-gradient-to-b from-white to-primary-50"
      />

      <CourseShowcaseSection
        id="planning-heading"
        title={t("showcases.planning.title")}
        description={t("showcases.planning.description")}
        courses={planningCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar?kategori=planlama"
        viewAllLabel={t("showcases.viewAll")}
      />

      <CourseShowcaseSection
        id="hr-heading"
        title={t("showcases.hr.title")}
        description={t("showcases.hr.description")}
        courses={hrCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar?kategori=insan-kaynaklari"
        viewAllLabel={t("showcases.viewAll")}
        className="bg-primary-50"
      />

      <CourseShowcaseSection
        id="other-paid-heading"
        title={t("showcases.expert.title")}
        courses={otherPaidCourses}
        productBySlug={productBySlug}
        statsBySlug={statsBySlug}
        viewAllHref="/kurslar"
        viewAllLabel={t("showcases.viewAll")}
      />

      <FreeCoursesHubSection />

      <AcademyKitaplikPromoSection />
      <InspirationBanner />

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
              {t("b2b.title")}
            </h2>
            <p className="text-primary-100">{t("b2b.body")}</p>
          </div>
          <Button variant="gold" size="lg" asChild>
            <Link href="/kurumsal">{t("b2b.cta")}</Link>
          </Button>
        </Container>
      </section>
    </>
  );
}
