import { Container } from "@/components/layout/container";
import { FeaturedCourseSpotlightCarousel } from "@/components/marketing/featured-course-spotlight-carousel";
import { FeaturedCourseStageLights } from "@/components/marketing/featured-course-stage-lights";
import { getFeaturedCourseSpotlights } from "@/lib/course/featured-course-spotlight";

export async function FeaturedCourseSpotlightSection() {
  const courses = await getFeaturedCourseSpotlights(3);

  if (courses.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden border-b border-primary-900/40 py-12 sm:py-16 md:py-20"
      aria-labelledby="featured-course-spotlight-heading"
    >
      <FeaturedCourseStageLights />

      <Container size="wide" className="relative z-10">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">
            Yeni eğitimler
          </p>
          <h2
            id="featured-course-spotlight-heading"
            className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Güncel eğitimleri keşfedin
          </h2>
          <p className="mt-3 text-base text-primary-100/80 md:text-lg">
            Eşit boyutlu kartlarla yeni kursları karşılaştırın; eğitmen, süre,
            hedef kitle ve ek materyaller tek bakışta.
          </p>
        </div>

        <FeaturedCourseSpotlightCarousel courses={courses} />
      </Container>
    </section>
  );
}
