import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, ChevronLeft } from "lucide-react";
import { AdminCourseCatalogPanel } from "@/components/catalog/admin-course-catalog-panel";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import { listAdminCatalogCourses } from "@/lib/course/catalog-admin";
import type { CatalogPublishedFilter } from "@/lib/course/catalog-admin";

export const metadata: Metadata = {
  title: "Kurs Kataloğu Yönetimi",
};

export const dynamic = "force-dynamic";

interface AdminCoursesPageProps {
  searchParams?: Promise<{
    q?: string;
    category?: string;
    status?: string;
    page?: string;
  }>;
}

function parsePublishedFilter(value: string | undefined): CatalogPublishedFilter {
  if (value === "published" || value === "unpublished") {
    return value;
  }
  return "all";
}

export default async function AdminCoursesPage({ searchParams }: AdminCoursesPageProps) {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    redirect("/panel");
  }

  const params = (await searchParams) ?? {};
  const search = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const published = parsePublishedFilter(params.status);
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const catalog = await listAdminCatalogCourses({
    search,
    category,
    published,
    page,
  });

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/panel"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-950"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Panele dön
      </Link>

      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary-950 p-2">
              <BookOpen className="h-6 w-6 text-accent-400" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
              Kurs Kataloğu
            </h1>
          </div>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Tüm kursları listeden görün; MIT, İngilizce ve diğer içerikleri tek
            tıkla yayına alın veya yayından kaldırın.
          </p>
        </div>
      </header>

      <AdminCourseCatalogPanel
        key={`${search}|${category}|${published}|${page}`}
        courses={catalog.courses}
        categories={catalog.categories}
        total={catalog.total}
        page={catalog.page}
        totalPages={catalog.totalPages}
        search={search}
        category={category}
        published={published}
      />
    </div>
  );
}
