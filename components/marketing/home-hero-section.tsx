import {
  filterPurchasableCourses,
  pickCoursesByCategorySlugs,
  pickFeaturedCoursesByCategory,
} from "@/lib/course/pick-featured-courses";
import { Hero } from "@/components/marketing/hero";
import { getHomepageCatalog } from "@/lib/wordpress/homepage-data";
import type { CourseProduct } from "@/types/course-product";

function pickHeroCarouselCourses(
  allCourses: Awaited<ReturnType<typeof getHomepageCatalog>>["courses"],
  categories: Awaited<ReturnType<typeof getHomepageCatalog>>["categories"],
  productBySlug: Map<string, CourseProduct>,
) {
  const coursesWithImages = allCourses.filter((course) => course.featuredImage);

  let carouselCourses = pickFeaturedCoursesByCategory(
    coursesWithImages,
    categories,
    5,
  );

  if (carouselCourses.length < 3) {
    carouselCourses = pickCoursesByCategorySlugs(
      coursesWithImages,
      [
        "planlama",
        "insan-kaynaklari",
        "ai",
        "bt",
        "ingilizce-egitimi",
        "mit-egitimleri",
        "yoga",
        "yazilim",
        "kocluk",
      ],
      5,
    );
  }

  if (carouselCourses.length === 0) {
    carouselCourses = pickFeaturedCoursesByCategory(
      filterPurchasableCourses(allCourses, productBySlug),
      categories,
      5,
    );
  }

  if (carouselCourses.length === 0 && allCourses.length > 0) {
    carouselCourses = allCourses.slice(0, 5);
  }

  return carouselCourses;
}

export async function HomeHeroSection() {
  const { courses: allCourses, categories, products } = await getHomepageCatalog();
  const productBySlug = new Map(products.map((p) => [p.course_slug, p]));
  const carouselCourses = pickHeroCarouselCourses(
    allCourses,
    categories,
    productBySlug,
  );

  return <Hero courses={carouselCourses} />;
}
