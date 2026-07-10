import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BookOpen, Clock, Eye, Lock, PlayCircle } from "lucide-react";
import {
  formatLessonDuration,
  type CourseCurriculumPreview,
} from "@/lib/lessons/curriculum-preview";

interface CourseCurriculumPreviewProps {
  courseSlug: string;
  curriculum: CourseCurriculumPreview;
}

export async function CourseCurriculumPreview({
  courseSlug,
  curriculum,
}: CourseCurriculumPreviewProps) {
  const t = await getTranslations("courses.curriculum");
  const locale = await getLocale();
  const totalDuration = formatLessonDuration(
    curriculum.totalDurationSeconds,
    locale,
  );

  return (
    <section className="mt-0 rounded-2xl border border-primary-100 bg-white p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-950">{t("title")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-primary-700">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-accent-600" />
            {t("lessons", { count: curriculum.totalLessons })}
          </span>
          {totalDuration ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-accent-600" />
              {totalDuration}
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-6">
        {curriculum.sections.map((section) => (
          <div key={section.id}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-700">
              {section.title}
            </h3>
            <ul className="divide-y divide-primary-100 rounded-xl border border-primary-100">
              {section.lessons.map((lesson, index) => {
                const duration = formatLessonDuration(
                  lesson.durationSeconds,
                  locale,
                );
                const previewHref =
                  `/kurslar/${courseSlug}/onizleme/${lesson.id}` as const;

                return (
                  <li
                    key={lesson.id}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                        {index + 1}
                      </span>
                      {lesson.isFreePreview ? (
                        <Link
                          href={previewHref}
                          className="truncate text-sm font-medium text-primary-950 hover:text-accent-700 hover:underline"
                        >
                          {lesson.title}
                        </Link>
                      ) : (
                        <span className="truncate text-sm font-medium text-primary-950">
                          {lesson.title}
                        </span>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      {duration ? <span>{duration}</span> : null}
                      {lesson.isFreePreview ? (
                        <Link
                          href={previewHref}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700 hover:bg-emerald-100"
                        >
                          <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                          {t("preview")}
                        </Link>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span className="sr-only">{t("lockedAria")}</span>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {curriculum.sections.some((section) =>
        section.lessons.some((lesson) => lesson.isFreePreview),
      ) ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <PlayCircle className="h-4 w-4 text-emerald-600" aria-hidden="true" />
          {t("previewHint")}
        </p>
      ) : null}
    </section>
  );
}
