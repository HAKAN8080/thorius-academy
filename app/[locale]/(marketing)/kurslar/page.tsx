import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Container } from "@/components/layout/container";
import { CourseGridSkeleton } from "@/components/marketing/course-card-skeleton";
import { KurslarCatalog } from "@/components/marketing/kurslar-catalog";
import {
  buildKurslarUrl,
  parseKurslarPage,
  parseKurslarSearch,
  parseKurslarLanguage,
} from "@/lib/course/kurslar-url";
import { canonicalizeCategorySlug } from "@/lib/course/category-slug";
import { getCoursesCacheListingPage } from "@/lib/course/courses-cache-catalog";

export const revalidate = 3600;
export const maxDuration = 20;

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: { kategori?: string; sayfa?: string; ara?: string; dil?: string };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "courses.catalog" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
  };
}

async function KurslarCatalogSection({
  page,
  categorySlug,
  searchQuery,
  language,
  locale,
}: {
  page: number;
  categorySlug?: string;
  searchQuery?: string;
  language?: ReturnType<typeof parseKurslarLanguage>;
  locale: string;
}) {
  let listing;
  try {
    listing = await getCoursesCacheListingPage({
      page,
      categorySlug,
      search: searchQuery,
      language,
      locale: locale === "en" ? "en" : "tr",
    });
  } catch (error) {
    console.error("[kurslar] listing failed:", {
      categorySlug,
      page,
      searchQuery,
      language,
      error,
    });
    listing = {
      courses: [],
      categories: [],
      languages: [],
      pagination: {
        page: 1,
        totalPages: 0,
        total: 0,
        perPage: 24,
      },
      totalPublished: 0,
      selectedCategory: categorySlug,
      selectedLanguage: language,
      searchQuery,
    };
  }

  if (
    page > listing.pagination.totalPages &&
    listing.pagination.totalPages > 0
  ) {
    redirect(
      buildKurslarUrl({
        page: listing.pagination.totalPages,
        categorySlug,
        search: searchQuery,
        language,
      }),
    );
  }

  return (
    <KurslarCatalog
      courses={listing.courses}
      categories={listing.categories}
      languages={listing.languages}
      pagination={listing.pagination}
      totalPublished={listing.totalPublished}
      selectedCategory={listing.selectedCategory}
      selectedLanguage={listing.selectedLanguage}
      searchQuery={listing.searchQuery}
    />
  );
}

export default async function KurslarPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  const t = await getTranslations("courses.catalog");
  const page = parseKurslarPage(searchParams.sayfa);
  const rawCategorySlug = searchParams.kategori?.trim() || undefined;
  const categorySlug = rawCategorySlug
    ? canonicalizeCategorySlug(rawCategorySlug)
    : undefined;
  const searchQuery = parseKurslarSearch(searchParams.ara);
  const rawLanguage = searchParams.dil?.trim() || undefined;
  const language = parseKurslarLanguage(rawLanguage);

  if (rawCategorySlug && categorySlug && rawCategorySlug !== categorySlug) {
    redirect(
      buildKurslarUrl({
        page,
        categorySlug,
        search: searchQuery,
        language,
      }),
    );
  }

  if (rawLanguage && !language) {
    redirect(
      buildKurslarUrl({
        page,
        categorySlug,
        search: searchQuery,
      }),
    );
  }

  const suspenseKey = `${categorySlug ?? "all"}-${language ?? "all"}-${page}-${searchQuery ?? ""}`;

  return (
    <div className="bg-[#0B1E3F]">
      <Container className="py-12 md:py-16">
        <div className="mb-8 md:mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
            {t("eyebrow")}
          </p>
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">
            {t("title")}
          </h1>
          <p className="text-lg text-white/70">{t("subtitle")}</p>
        </div>

        <Suspense
          key={suspenseKey}
          fallback={<CourseGridSkeleton count={8} variant="dark" />}
        >
          <KurslarCatalogSection
            page={page}
            categorySlug={categorySlug}
            searchQuery={searchQuery}
            language={language}
            locale={locale}
          />
        </Suspense>
      </Container>
    </div>
  );
}
