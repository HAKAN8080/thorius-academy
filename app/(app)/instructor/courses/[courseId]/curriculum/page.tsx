import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurriculumAccess } from "@/lib/instructor/curriculum-access";
import {
  getCurriculumCourse,
  getCurriculumLessons,
} from "@/lib/actions/instructor-curriculum";
import { CurriculumEditor } from "@/components/instructor/curriculum/curriculum-editor";

interface Props {
  params: Promise<{ courseId: string }>;
}

export const dynamic = "force-dynamic";

export default async function InstructorCurriculumPage({ params }: Props) {
  const { courseId: courseIdParam } = await params;
  const courseId = parseInt(courseIdParam, 10);

  if (!Number.isFinite(courseId)) {
    notFound();
  }

  const access = await getCurriculumAccess();
  if (!access.userId) {
    redirect(`/giris?redirect=/instructor/courses/${courseId}/curriculum`);
  }

  if (!access.canManage) {
    redirect("/panel/kurslarim");
  }

  const courseResult = await getCurriculumCourse(courseId);
  if ("error" in courseResult) {
    notFound();
  }

  const lessonsResult = await getCurriculumLessons(courseId);
  const lessons = "error" in lessonsResult ? [] : lessonsResult.lessons;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/panel/egitmen/${courseResult.course_slug}`}
        className="mb-6 inline-flex items-center gap-2 text-sm text-primary-700 hover:text-[#D4AF37]"
      >
        <ArrowLeft className="h-4 w-4" />
        Kursa Dön
      </Link>

      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
          Müfredat Yönetimi
        </p>
        <h1 className="text-2xl font-bold text-[#0B1E3F] sm:text-3xl">
          {courseResult.course_title}
        </h1>
        <p className="mt-2 text-sm text-primary-600">
          Dersleri sürükleyerek sıralayın, içerikleri düzenleyin ve yayınlayın.
        </p>
      </div>

      <CurriculumEditor course={courseResult} initialLessons={lessons} />
    </div>
  );
}
