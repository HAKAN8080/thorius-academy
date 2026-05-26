import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  getLessonsForCourse,
  syncCourseFromTutor,
} from "@/lib/actions/lesson-sync";
import { getUserLessonProgress } from "@/lib/actions/lesson-progress";
import { checkEnrollment } from "@/lib/actions/enrollment";
import { VideoPlayer } from "@/components/player/video-player";
import { MarkLessonCompleteButton } from "@/components/player/mark-lesson-complete-button";
import { LessonSidebar } from "@/components/player/lesson-sidebar";
import { Button } from "@/components/ui/button";
import { fetchCourseBySlug } from "@/lib/wordpress/api";
import { groupLessonsByTopic } from "@/lib/lessons/group-by-topic";
import { pickActiveLesson } from "@/lib/lessons/pick-active-lesson";
import type { LessonProgress } from "@/types/lesson";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lesson?: string }>;
}

function usesManualProgressTracking(
  videoType: string | null | undefined,
): boolean {
  return (
    videoType === "youtube" ||
    videoType === "vimeo" ||
    videoType === "external_url"
  );
}

export default async function CoursePlayerPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lesson: lessonParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/giris?redirect=/panel/kurslarim/${slug}`);
  }

  const course = await fetchCourseBySlug(slug);
  if (!course) notFound();

  const enrollment = await checkEnrollment(course.id);
  if (!enrollment) redirect(`/kurslar/${slug}`);

  let lessons = await getLessonsForCourse(slug);

  await syncCourseFromTutor(course.id, slug);
  lessons = await getLessonsForCourse(slug);

  if (lessons.length === 0) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-primary-950">
          Henüz ders eklenmemiş
        </h1>
        <p className="mb-6 text-muted-foreground">
          Bu kurs için ders içeriği yüklenmesi devam ediyor.
        </p>
        <Button asChild>
          <Link href="/panel/kurslarim">Kurslarıma Dön</Link>
        </Button>
      </div>
    );
  }

  const topics = groupLessonsByTopic(lessons);

  const progress = await getUserLessonProgress(course.id);
  const progressMap: Record<string, LessonProgress> = {};
  progress.forEach((p) => {
    progressMap[p.lesson_id] = p;
  });

  const activeLesson = pickActiveLesson(
    lessons,
    progress,
    enrollment,
    lessonParam,
  );
  const activeProgress = progressMap[activeLesson.id];
  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <div className="min-h-screen bg-primary-50/30">
      <div className="border-b border-primary-100 bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/panel/kurslarim"
              className="flex items-center gap-2 text-sm text-primary-700 hover:text-accent-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Kurslarım
            </Link>
            <h1 className="truncate text-base font-semibold text-primary-950">
              {course.title}
            </h1>
            <div className="hidden text-sm text-muted-foreground sm:block">
              {completedCount}/{lessons.length} tamamlandı
              {enrollment.progress > 0 ? ` · %${enrollment.progress}` : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <main className="space-y-4">
            <VideoPlayer
              key={activeLesson.id}
              videoType={activeLesson.video_type}
              videoUrl={activeLesson.video_url}
              embedUrl={activeLesson.video_embed_url}
              lessonId={activeLesson.id}
              courseId={course.id}
              courseSlug={slug}
              wpLessonId={activeLesson.wp_lesson_id}
              initialWatchedSeconds={activeProgress?.watched_seconds || 0}
            />

            {usesManualProgressTracking(activeLesson.video_type) ? (
              <MarkLessonCompleteButton
                lessonId={activeLesson.id}
                courseId={course.id}
                courseSlug={slug}
                wpLessonId={activeLesson.wp_lesson_id}
                isCompleted={!!activeProgress?.completed}
              />
            ) : null}

            <div className="rounded-2xl border border-primary-100 bg-white p-6">
              <div className="mb-3 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-accent-600">
                    {activeLesson.topic_title}
                  </p>
                  <h2 className="text-2xl font-bold text-primary-950">
                    {activeLesson.title}
                  </h2>
                </div>
                {activeProgress?.completed ? (
                  <div className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    Tamamlandı
                  </div>
                ) : null}
              </div>
              {activeLesson.description ? (
                <div
                  className="prose prose-sm max-w-none text-primary-700"
                  dangerouslySetInnerHTML={{ __html: activeLesson.description }}
                />
              ) : null}
            </div>
          </main>

          <LessonSidebar
            courseSlug={slug}
            topics={topics}
            currentLessonId={activeLesson.id}
            progressMap={progressMap}
          />
        </div>
      </div>
    </div>
  );
}
