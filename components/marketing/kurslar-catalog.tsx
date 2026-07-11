import { getTranslations } from "next-intl/server";
import { CourseCardV2 } from "@/components/course/course-card-v2";
import { CategoryFilter } from "@/components/marketing/category-filter";
import { LanguageFilter } from "@/components/marketing/language-filter";
import { CatalogPagination } from "@/components/marketing/catalog-pagination";
import { CourseSearchForm } from "@/components/marketing/course-search-form";
import type {
  CatalogCategoryItem,
  CatalogCourseItem,
  CatalogLanguageItem,
} from "@/lib/course/courses-cache-catalog";
import type { CourseLanguageCode } from "@/lib/course/course-language";

interface KurslarCatalogProps {
  courses: CatalogCourseItem[];
  categories: CatalogCategoryItem[];
  languages: CatalogLanguageItem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  totalPublished: number;
  selectedCategory?: string;
  selectedLanguage?: CourseLanguageCode;
  searchQuery?: string;
}

function mapCourseToCardProps(course: CatalogCourseItem) {
  const isFree = course.pricingModel === "free" || course.price <= 0;
  const priceNormal = isFree ? null : course.price;
  const priceSale =
    !isFree && course.salePrice != null && course.salePrice < course.price
      ? course.salePrice
      : null;

  return {
    slug: course.slug,
    title: course.title,
    excerpt: course.description,
    thumbnail: course.coverImageUrl ?? undefined,
    category: course.category ?? undefined,
    level: course.level,
    language: course.language,
    subtitleLanguage: course.subtitleLanguage,
    priceNormal,
    priceSale,
  };
}

export async function KurslarCatalog({
  courses,
  categories,
  languages,
  pagination,
  totalPublished,
  selectedCategory,
  selectedLanguage,
  searchQuery,
}: KurslarCatalogProps) {
  const t = await getTranslations("courses.catalog");

  if (totalPublished === 0 && courses.length === 0 && !searchQuery) {
    return (
      <div className="py-16 text-center">
        <p className="text-white/70">{t("noCourses")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside aria-label={t("filtersAria")} className="space-y-8">
        <CategoryFilter
          categories={categories}
          selectedSlug={selectedCategory}
          selectedLanguage={selectedLanguage}
          totalCount={totalPublished}
          searchQuery={searchQuery}
          variant="dark"
        />
        <LanguageFilter
          languages={languages}
          selectedLanguage={selectedLanguage}
          totalCount={totalPublished}
          categorySlug={selectedCategory}
          searchQuery={searchQuery}
          variant="dark"
        />
      </aside>

      <div className="space-y-6">
        <CourseSearchForm
          defaultQuery={searchQuery}
          categorySlug={selectedCategory}
          language={selectedLanguage}
          variant="dark"
        />

        {searchQuery ? (
          <p className="text-sm text-white/70">
            {t("searchResults", {
              query: searchQuery,
              total: pagination.total,
            })}
          </p>
        ) : null}

        {courses.length === 0 ? (
          <div className="py-16 text-center">
            {searchQuery ? (
              <p className="text-white/70">
                {t("noSearchResults", { query: searchQuery })}
              </p>
            ) : selectedCategory || selectedLanguage ? (
              <p className="text-white/70">{t("noCoursesInFilter")}</p>
            ) : (
              <p className="text-white/70">{t("noCourses")}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCardV2
                  key={course.id}
                  {...mapCourseToCardProps(course)}
                />
              ))}
            </div>

            <CatalogPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              categorySlug={selectedCategory}
              language={selectedLanguage}
              searchQuery={searchQuery}
              variant="dark"
            />
          </>
        )}
      </div>
    </div>
  );
}
