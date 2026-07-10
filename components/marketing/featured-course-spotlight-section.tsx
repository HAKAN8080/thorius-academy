import { Container } from "@/components/layout/container";
import { FeaturedCourseSpotlightCarousel } from "@/components/marketing/featured-course-spotlight-carousel";
import { FeaturedCourseStageLights } from "@/components/marketing/featured-course-stage-lights";
import { getFeaturedCourseSpotlights } from "@/lib/course/featured-course-spotlight";

export async function FeaturedCourseSpotlightSection() {
  const courses = await getFeaturedCourseSpotlights();

  if (courses.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden border-b border-primary-100 bg-white py-12 sm:py-16 md:py-20"
      aria-labelledby="featured-course-spotlight-heading"
    >
      <FeaturedCourseStageLights />

      <Container size="wide" className="relative z-10">
        <div className="mb-8 max-w-3xl sm:mb-10">
          <h2
            id="featured-course-spotlight-heading"
            className="text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
          >
            En çok rağbet gören eğitimler
          </h2>
        </div>

        <FeaturedCourseSpotlightCarousel courses={courses} />
      </Container>
    </section>
  );
}
