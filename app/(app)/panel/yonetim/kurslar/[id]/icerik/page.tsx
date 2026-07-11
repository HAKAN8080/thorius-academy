import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Languages } from "lucide-react";
import { AdminCourseContentEditor } from "@/components/catalog/admin-course-content-editor";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import { getAdminCatalogCourseContent } from "@/lib/course/catalog-admin";

export const metadata: Metadata = {
  title: "Kurs İçeriği Düzenle",
};

export const dynamic = "force-dynamic";

interface AdminCourseContentPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminCourseContentPage({
  params,
}: AdminCourseContentPageProps) {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    redirect("/panel");
  }

  const { id } = await params;

  let content;
  try {
    content = await getAdminCatalogCourseContent(id);
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        href="/panel/yonetim/kurslar"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary-700 hover:text-primary-950"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Kurs Kataloğu
      </Link>

      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-primary-950 p-2">
            <Languages className="h-6 w-6 text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-950 md:text-3xl">
              {content.title}
            </h1>
            <p className="text-muted-foreground">
              Türkçe ve İngilizce kurs metinlerini ile müfredat başlıklarını düzenleyin.
            </p>
          </div>
        </div>
      </header>

      <AdminCourseContentEditor initialContent={content} />
    </div>
  );
}
