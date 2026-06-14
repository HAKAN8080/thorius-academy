import { CourseCardV2 } from "@/components/course/course-card-v2";
import { CategoryFilter } from "@/components/marketing/category-filter";
import { CatalogPagination } from "@/components/marketing/catalog-pagination";
import { CourseSearchForm } from "@/components/marketing/course-search-form";
import type {
  CatalogCategoryItem,
  CatalogCourseItem,
} from "@/lib/course/courses-cache-catalog";

interface KurslarCatalogProps {
  courses: CatalogCourseItem[];
  categories: CatalogCategoryItem[];
  pagination: {
    page: number;
    totalPages: number;
    total: number;
    perPage: number;
  };
  totalPublished: number;
  selectedCategory?: string;
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
    priceNormal,
    priceSale,
  };
}

function EmptyStateMessage({
  searchQuery,
  selectedCategory,
}: {
  searchQuery?: string;
  selectedCategory?: string;
}) {
  if (searchQuery) {
    return (
      <p className="text-white/70">
        <span className="font-medium text-[#D4AF37]">
          &ldquo;{searchQuery}&rdquo;
        </span>{" "}
        ile eşleşen kurs bulunamadı.
      </p>
    );
  }

  if (selectedCategory) {
    return (
      <p className="text-white/70">Bu kategoride henüz kurs bulunmuyor.</p>
    );
  }

  return <p className="text-white/70">Henüz kurs yok.</p>;
}

export function KurslarCatalog({
  courses,
  categories,
  pagination,
  totalPublished,
  selectedCategory,
  searchQuery,
}: KurslarCatalogProps) {
  if (totalPublished === 0 && courses.length === 0 && !searchQuery) {
    return (
      <div className="py-16 text-center">
        <p className="text-white/70">Henüz kurs yok.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside aria-label="Kategori filtresi">
        <CategoryFilter
          categories={categories}
          selectedSlug={selectedCategory}
          totalCount={totalPublished}
          searchQuery={searchQuery}
          variant="dark"
        />
      </aside>

      <div className="space-y-6">
        <CourseSearchForm
          defaultQuery={searchQuery}
          categorySlug={selectedCategory}
          variant="dark"
        />

        {searchQuery ? (
          <p className="text-sm text-white/70">
            <span className="font-medium text-[#D4AF37]">
              &ldquo;{searchQuery}&rdquo;
            </span>{" "}
            için {pagination.total} sonuç bulundu
          </p>
        ) : null}

        {courses.length === 0 ? (
          <div className="py-16 text-center">
            <EmptyStateMessage
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
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
              searchQuery={searchQuery}
              variant="dark"
            />
          </>
        )}
      </div>
    </div>
  );
}
