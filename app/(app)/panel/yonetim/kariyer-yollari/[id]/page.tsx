import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminPathForm } from "@/components/career-path/admin-path-form";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import { getAdminCourseOptions } from "@/lib/career-path/admin-course-options";
import { getCareerPathAdminById } from "@/lib/career-path/repository";
import type { CareerPathAdminInput } from "@/lib/career-path/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id: slugOrId } = await params;
  const data = await getCareerPathAdminById(slugOrId);
  return {
    title: data ? `${data.path.title} — Düzenle` : "Kariyer Yolu Düzenle",
  };
}

function toAdminInput(
  data: NonNullable<Awaited<ReturnType<typeof getCareerPathAdminById>>>,
): CareerPathAdminInput {
  return {
    slug: data.path.slug,
    title: data.path.title,
    subtitle: data.path.subtitle,
    heroEyebrow: data.path.hero_eyebrow,
    outcomes: data.path.outcomes,
    catalogHref: data.path.catalog_href,
    catalogLabel: data.path.catalog_label,
    closingTitle: data.path.closing_title,
    closingDescription: data.path.closing_description,
    isPublished: data.path.is_published,
    sortOrder: data.path.sort_order,
    steps: data.steps.map((step) => ({
      stepOrder: step.step_order,
      level: step.level,
      label: step.label,
      courseSlug: step.course_slug,
      fallbackTitle: step.fallback_title,
      description: step.description,
    })),
  };
}

export default async function EditCareerPathPage({ params }: PageProps) {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    redirect("/panel");
  }

  const { id: slugOrId } = await params;
  const [data, courses] = await Promise.all([
    getCareerPathAdminById(slugOrId),
    getAdminCourseOptions(),
  ]);
  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/panel/yonetim/kariyer-yollari"
        className="mb-6 inline-flex items-center text-sm font-medium text-primary-700 hover:text-primary-950"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Kariyer yolları listesi
      </Link>

      <header className="mb-8">
        <h1 className="text-3xl font-bold text-primary-950">{data.path.title}</h1>
        <p className="mt-2 text-muted-foreground">
          /kariyer-yolu/{data.path.slug} · /panel/kariyer-yolu/{data.path.slug}
        </p>
      </header>

      {courses.length === 0 ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Kurs listesi şu an yüklenemedi. Adımları kaydedebilirsiniz; katalog
          seçimi için sayfayı yenileyin veya slug ile devam edin.
        </div>
      ) : null}

      <AdminPathForm
        pathId={data.path.id}
        initial={toAdminInput(data)}
        courses={courses}
      />
    </div>
  );
}
