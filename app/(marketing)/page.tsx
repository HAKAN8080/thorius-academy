import Link from "next/link";
import { Building2 } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Hero } from "@/components/marketing/hero";
import { EcosystemCards } from "@/components/marketing/ecosystem-cards";
import { CategoryGrid } from "@/components/marketing/category-grid";
import { CourseCard } from "@/components/marketing/course-card";
import { Button } from "@/components/ui/button";
import { getAllCourseProducts } from "@/lib/actions/course-products";
import { fetchAllCategories, fetchAllCourses } from "@/lib/wordpress/api";
import type { CourseProduct } from "@/types/course-product";

export const revalidate = 3600;

export default async function HomePage() {
  const [allCourses, categories, products] = await Promise.all([
    fetchAllCourses(),
    fetchAllCategories(),
    getAllCourseProducts(),
  ]);
  const productBySlug = new Map<string, CourseProduct>(
    products.map((p) => [p.course_slug, p]),
  );
  const featuredCourses = allCourses.slice(0, 6);
  const carouselCourses = allCourses.slice(0, 6);

  return (
    <>
      <Hero courses={carouselCourses} />
      <EcosystemCards />
      <CategoryGrid categories={categories} />

      {featuredCourses.length > 0 && (
        <section
          className="bg-gradient-to-b from-white to-primary-50 py-16 md:py-20"
          aria-labelledby="featured-heading"
        >
          <Container>
            <div className="mb-12 text-center">
              <h2
                id="featured-heading"
                className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl"
              >
                Öne Çıkan Kurslar
              </h2>
              <p className="text-lg text-muted-foreground">
                Profesyoneller için seçilmiş premium eğitimler
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  product={productBySlug.get(course.slug) ?? null}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/kurslar"
                className="inline-flex items-center gap-2 font-semibold text-primary-950 transition-colors hover:text-accent-600"
              >
                Tüm Kursları Görüntüle →
              </Link>
            </div>
          </Container>
        </section>
      )}

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
