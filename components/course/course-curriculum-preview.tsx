import { BookOpen, Clock, Lock } from "lucide-react";
import {
  formatLessonDuration,
  type CourseCurriculumPreview,
} from "@/lib/lessons/curriculum-preview";

interface CourseCurriculumPreviewProps {
  curriculum: CourseCurriculumPreview;
}

export function CourseCurriculumPreview({
  curriculum,
}: CourseCurriculumPreviewProps) {
  const totalDuration = formatLessonDuration(curriculum.totalDurationSeconds);

  return (
    <section className="mt-12 rounded-2xl border border-primary-100 bg-white p-6 md:p-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-950">Müfredat</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kayıt olmadan önce kurs içeriğini inceleyin
          </p>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-primary-700">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-accent-600" />
            {curriculum.totalLessons} ders
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
        {curriculum.topics.map((topic) => (
          <div key={topic.title}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent-700">
              {topic.title}
            </h3>
            <ul className="divide-y divide-primary-100 rounded-xl border border-primary-100">
              {topic.lessons.map((lesson, index) => {
                const duration = formatLessonDuration(lesson.durationSeconds);
                return (
                  <li
                    key={`${topic.title}-${lesson.title}-${index}`}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-700">
                        {index + 1}
                      </span>
                      <span className="truncate text-sm font-medium text-primary-950">
                        {lesson.title}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                      {duration ? <span>{duration}</span> : null}
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">Kayıt sonrası erişim</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
