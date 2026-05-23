import Link from "next/link";
import { Building2, ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/marketing/hero";
import { EcosystemCards } from "@/components/marketing/ecosystem-cards";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { CourseCard } from "@/components/marketing/course-card";
import { Button } from "@/components/ui/button";
import { courses } from "@/lib/data/courses";

const featuredCourses = courses.filter((c) => c.featured);

export default function HomePage() {
  return (
    <>
      <Hero />
      <EcosystemCards />
      <CategoryGrid />

      <section className="bg-primary-50/50 py-16" aria-labelledby="featured-heading">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h2
                id="featured-heading"
                className="text-3xl font-bold text-primary-900"
              >
                Öne Çıkan Kurslar
              </h2>
              <p className="mt-2 text-primary-700">
                Sektör liderlerinden seçilmiş programlar
              </p>
            </div>
            <Button variant="outline" className="rounded-xl" asChild>
              <Link href="/kurslar">
                Tümünü Gör
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </Container>
      </section>

      <section
        className="border-y border-primary-100 bg-primary-900 py-16 text-white"
        aria-labelledby="b2b-heading"
      >
        <Container className="flex flex-col items-center gap-8 text-center lg:flex-row lg:justify-between lg:text-left">
          <div className="flex max-w-xl flex-col items-center gap-4 lg:items-start">
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

      <section id="hakkimizda" className="py-16">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl font-bold text-primary-900">Hakkımızda</h2>
          <p className="mt-4 text-primary-700">
            Thorius Academy, Türkiye perakende sektörünün lider markalarına
            MasterClass kalitesinde, McKinsey derinliğinde eğitim sunar. AI
            destekli içerikler ve sektör deneyimini bir araya getiriyoruz.
          </p>
        </Container>
      </section>
    </>
  );
}
