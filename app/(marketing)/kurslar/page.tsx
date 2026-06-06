import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { KurslarCatalog } from "@/components/marketing/kurslar-catalog";
import {
  buildKurslarUrl,
  parseKurslarPage,
} from "@/lib/course/kurslar-url";
import { getCourseListingPage } from "@/lib/wordpress/catalog";

export const metadata: Metadata = {
  title: "Tüm Kurslar",
  description:
    "Perakende, AI, liderlik ve daha fazlası. Thorius Academy'nin premium kurs kataloğu.",
};

export const revalidate = 3600;

interface KurslarPageProps {
  searchParams: { kategori?: string; sayfa?: string };
}

async function KurslarCatalogSection({
  page,
  categorySlug,
}: {
  page: number;
  categorySlug?: string;
}) {
  const listing = await getCourseListingPage({ page, categorySlug });

  if (
    page > listing.pagination.totalPages &&
    listing.pagination.totalPages > 0
  ) {
    redirect(
      buildKurslarUrl({
        page: listing.pagination.totalPages,
        categorySlug,
      }),
    );
  }

  return (
    <KurslarCatalog
      courses={listing.courses}
      categories={listing.categories}
      products={listing.products}
      stats={listing.stats}
      pagination={listing.pagination}
      totalPublished={listing.totalPublished}
      selectedCategory={listing.selectedCategory}
    />
  );
}

export default function KurslarPage({ searchParams }: KurslarPageProps) {
  const page = parseKurslarPage(searchParams.sayfa);
  const categorySlug = searchParams.kategori?.trim() || undefined;
  const suspenseKey = `${categorySlug ?? "all"}-${page}`;

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

      <Suspense key={suspenseKey} fallback={<CourseGridSkeleton count={8} />}>
        <KurslarCatalogSection page={page} categorySlug={categorySlug} />
      </Suspense>
    </Container>
  );
}
