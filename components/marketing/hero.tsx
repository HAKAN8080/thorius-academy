import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { HeroCourseCarousel } from "@/components/marketing/hero-course-carousel";
import type { Course } from "@/types/wordpress";

interface HeroProps {
  courses: Course[];
}

export function Hero({ courses }: HeroProps) {
  return (
    <section
      className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-12 sm:py-16 md:py-24 lg:py-32"
      aria-labelledby="hero-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl md:-right-8 md:h-96 md:w-96" />
        <div className="absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-primary-500/10 blur-3xl" />
        <div className="owl-pattern absolute inset-0 opacity-[0.04]" />
      </div>

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="order-2 flex max-w-3xl flex-col gap-4 sm:gap-6 lg:order-1">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-accent-500/40 owl-glow">
                <Image
                  src="/images/bilge-baykus.png"
                  alt=""
                  fill
                  className="object-cover object-top"
                  sizes="48px"
                  priority
                />
              </div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-400 sm:px-4 sm:py-2 sm:text-sm">
                Bilge Baykuş ile Premium İş Akademisi
              </p>
            </div>
            <h1
              id="hero-heading"
              className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Profesyonellerin{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Yeni Nesil
              </span>{" "}
              Akademisi
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-primary-100 sm:text-lg md:text-xl lg:text-2xl">
              Perakende, İK, AI, liderlik ve daha fazlası — sektörün en
              deneyimli isimlerinden, Bilge Baykuş rehberliğinde AI ile
              zenginleştirilmiş premium eğitim deneyimi
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
                asChild
              >
                <Link href="/kurslar">Kurslara Göz At</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-2 border-white bg-transparent text-white hover:bg-white hover:text-primary-950 sm:w-auto"
                asChild
              >
                <Link href="/#bilge-baykus">Bilge Baykuş&apos;u Tanı</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            {courses.length > 0 && <HeroCourseCarousel courses={courses} />}
          </div>
        </div>
      </Container>
    </section>
  );
}
