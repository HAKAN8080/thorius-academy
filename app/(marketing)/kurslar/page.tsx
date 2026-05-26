import type { Metadata } from "next";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { KurslarCatalog } from "@/components/marketing/kurslar-catalog";
import { getCourseCatalog } from "@/lib/wordpress/catalog";

export const metadata: Metadata = {
  title: "Tüm Kurslar",
  description:
    "Perakende, AI, liderlik ve daha fazlası. Thorius Academy'nin premium kurs kataloğu.",
};

export const revalidate = 3600;

export default async function KurslarPage() {
  const catalog = await getCourseCatalog();

  return (
    <Container className="py-12 md:py-16">
      <div className="mb-8 md:mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          Tüm Kurslar
        </h1>
        <p className="text-lg text-muted-foreground">
          Perakende profesyonelleri için seçilmiş eğitim programları
        </p>
      </div>

      <Suspense fallback={<CourseGridSkeleton count={8} />}>
        <KurslarCatalog
          courses={catalog.courses}
          categories={catalog.categories}
          products={catalog.products}
          stats={catalog.stats}
        />
      </Suspense>
    </Container>
  );
}
