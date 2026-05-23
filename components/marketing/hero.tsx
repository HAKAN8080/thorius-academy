import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { HeroCourseCarousel } from "@/components/marketing/hero-course-carousel";
import { courses } from "@/lib/data/courses";

const carouselCourses = courses.filter((course) => course.featured);

export function Hero() {
  return (
    <section
      className="relative bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-24 md:py-32"
      aria-labelledby="hero-heading"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl md:-right-8 md:h-96 md:w-96" />
      </div>

      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 max-w-3xl lg:order-1">
            <p className="mb-6 inline-block rounded-full border border-accent-500/30 bg-accent-500/10 px-4 py-2 text-sm font-medium text-accent-400">
              Premium B2B Perakende Akademisi
            </p>
            <h1
              id="hero-heading"
              className="max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl"
            >
              <span className="text-white">Perakendenin </span>
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Yeni Nesil{" "}
              </span>
              <span className="text-white">Akademisi</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-primary-100 md:text-2xl">
              Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş
              premium eğitim deneyimi
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
                asChild
              >
                <Link href="/kurslar">Kurslara Göz At</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-950"
                asChild
              >
                <Link href="/kurumsal">Kurumsal Çözüm</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <HeroCourseCarousel courses={carouselCourses} />
          </div>
        </div>
      </Container>
    </section>
  );
}
