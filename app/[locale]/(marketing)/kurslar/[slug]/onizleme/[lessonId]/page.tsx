import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/layout/container";
import { PreviewVideoPlayer } from "@/components/course/preview-video-player";
import { getPreviewLessonById } from "@/lib/actions/lesson-sync";
import { fetchCourseBySlug } from "@/lib/wordpress/api";

interface Props {
  params: { slug: string; lessonId: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const t = await getTranslations("courses.preview");
  const course = await fetchCourseBySlug(params.slug);
  if (!course) return { title: t("metaTitle") };

  const lesson = await getPreviewLessonById(
    params.slug,
    course.id,
    params.lessonId,
  );

  return {
    title: lesson
      ? t("metaTitleWithLesson", { lesson: lesson.title, course: course.title })
      : t("metaTitleCourse", { course: course.title }),
  };
}

export default async function LessonPreviewPage({ params }: Props) {
  const t = await getTranslations("courses.preview");
  const course = await fetchCourseBySlug(params.slug);
  if (!course) notFound();

  const lesson = await getPreviewLessonById(
    params.slug,
    course.id,
    params.lessonId,
  );
  if (!lesson) notFound();

  return (
    <article className="py-10 md:py-14">
      <Container size="narrow">
        <Link
          href={`/kurslar/${params.slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-accent-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {t("backToCourse")}
        </Link>

        <div className="mb-4 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
          {t("badge")}
        </div>

        <h1 className="mb-2 text-2xl font-bold text-primary-950 md:text-3xl">
          {lesson.title}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{course.title}</p>

        <PreviewVideoPlayer
          videoType={lesson.video_type}
          videoUrl={lesson.video_url}
          embedUrl={lesson.video_embed_url}
        />
      </Container>
    </article>
  );
}
