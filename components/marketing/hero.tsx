import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { HeroCourseCarousel } from "@/components/marketing/hero-course-carousel";
import { SignupDiscountBadge } from "@/components/marketing/signup-discount-badge";
import type { Course } from "@/types/wordpress";

interface HeroProps {
  courses: Course[];
}

export function Hero({ courses }: HeroProps) {
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
          <div className="order-2 flex flex-col gap-4 sm:gap-6 xl:order-1">
            <div className="flex flex-wrap items-center gap-3">
              <Image
                src="/images/thorius-academy-logo.png"
                alt="Thorius Academy"
                width={140}
                height={56}
                className="h-12 w-auto object-contain sm:h-14"
                priority
              />
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-medium text-accent-400 sm:px-4 sm:py-2 sm:text-sm">
                Perakende Planlama Uzmanlık Akademisi
              </p>
            </div>
            <h1
              id="hero-heading"
              className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            >
              Perakende planlamada{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                uzmanlaşın
              </span>
            </h1>
            <p className="max-w-3xl text-base leading-relaxed text-primary-100 sm:text-lg md:text-xl lg:text-2xl">
              OTB, range plan, envanter ve AI destekli forecast — kariyer
              sonucuna odaklı öğrenme yolları ve sektör deneyimli eğitmenler
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Button
                size="lg"
                className="w-full rounded-xl bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600 sm:w-auto"
                asChild
              >
                <Link href="/kariyer-yolu">Kariyer yollarını gör</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full rounded-xl border-2 border-white/80 bg-transparent text-white hover:bg-white hover:text-primary-950 sm:w-auto"
                asChild
              >
                <Link href="/kurslar">Tüm kurslar</Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="w-full rounded-xl text-primary-100 hover:bg-white/10 hover:text-white sm:w-auto"
                asChild
              >
                <Link href="/kayit">Üye ol — %20 indirim</Link>
              </Button>
            </div>
          </div>

          <div className="order-1 xl:order-2">
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_12.5rem]">
              <div className="min-w-0">
                {courses.length > 0 && <HeroCourseCarousel courses={courses} />}
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
