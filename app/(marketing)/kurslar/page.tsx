import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { KurslarCatalog } from "@/components/marketing/kurslar-catalog";
import {
  buildKurslarUrl,
  parseKurslarPage,
  parseKurslarSearch,
} from "@/lib/course/kurslar-url";
import { canonicalizeCategorySlug } from "@/lib/course/category-slug";
import { getCoursesCacheListingPage } from "@/lib/course/courses-cache-catalog";

export const metadata: Metadata = {
  title: "Tüm Kurslar",
  description:
    "Perakende, AI, liderlik ve daha fazlası. Thorius Academy'nin premium kurs kataloğu.",
};

export const revalidate = 3600;

interface KurslarPageProps {
  searchParams: { kategori?: string; sayfa?: string; ara?: string };
}

async function KurslarCatalogSection({
  page,
  categorySlug,
  searchQuery,
}: {
  page: number;
  categorySlug?: string;
  searchQuery?: string;
}) {
  const listing = await getCoursesCacheListingPage({
    page,
    categorySlug,
    search: searchQuery,
  });

  if (
    page > listing.pagination.totalPages &&
    listing.pagination.totalPages > 0
  ) {
    redirect(
      buildKurslarUrl({
        page: listing.pagination.totalPages,
        categorySlug,
        search: searchQuery,
      }),
    );
  }

  return (
    <KurslarCatalog
      courses={listing.courses}
      categories={listing.categories}
      pagination={listing.pagination}
      totalPublished={listing.totalPublished}
      selectedCategory={listing.selectedCategory}
      searchQuery={listing.searchQuery}
    />
  );
}

export default function KurslarPage({ searchParams }: KurslarPageProps) {
  const page = parseKurslarPage(searchParams.sayfa);
  const rawCategorySlug = searchParams.kategori?.trim() || undefined;
  const categorySlug = rawCategorySlug
    ? canonicalizeCategorySlug(rawCategorySlug)
    : undefined;
  const searchQuery = parseKurslarSearch(searchParams.ara);

  if (rawCategorySlug && categorySlug && rawCategorySlug !== categorySlug) {
    redirect(
      buildKurslarUrl({
        page,
        categorySlug,
        search: searchQuery,
      }),
    );
  }

  const suspenseKey = `${categorySlug ?? "all"}-${page}-${searchQuery ?? ""}`;

  return (
    <div className="bg-[#0B1E3F]">
      <Container className="py-12 md:py-16">
        <div className="mb-8 md:mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            Thorius Academy
          </p>
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            Tüm Kurslar
          </h1>
          <p className="text-lg text-white/70">
            Perakende profesyonelleri için seçilmiş eğitim programları
          </p>
        </div>

        <Suspense
          key={suspenseKey}
          fallback={<CourseGridSkeleton count={8} variant="dark" />}
        >
          <KurslarCatalogSection
            page={page}
            categorySlug={categorySlug}
            searchQuery={searchQuery}
          />
        </Suspense>
      </Container>
    </div>
  );
}
