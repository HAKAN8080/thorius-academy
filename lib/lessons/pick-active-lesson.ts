import type { Lesson, LessonProgress } from "@/types/lesson";
import type { Enrollment } from "@/types/enrollment";

export function pickActiveLesson(
  lessons: Lesson[],
  progress: LessonProgress[],
  enrollment: Enrollment | null,
  lessonParam?: string,
): Lesson {
  if (lessonParam) {
    const fromParam = lessons.find((l) => l.id === lessonParam);
    if (fromParam) return fromParam;
  }

  if (enrollment?.last_lesson_id) {
    const fromEnrollment = lessons.find(
      (l) => l.wp_lesson_id === enrollment.last_lesson_id,
    );
    if (fromEnrollment) return fromEnrollment;
  }

  const progressMap = new Map(progress.map((p) => [p.lesson_id, p]));
  const firstIncomplete = lessons.find((l) => !progressMap.get(l.id)?.completed);
  if (firstIncomplete) return firstIncomplete;

  const lastWatched = [...progress].sort(
    (a, b) =>
      new Date(b.last_watched_at).getTime() -
      new Date(a.last_watched_at).getTime(),
  )[0];

  if (lastWatched) {
    const fromProgress = lessons.find((l) => l.id === lastWatched.lesson_id);
    if (fromProgress) return fromProgress;
  }

  return lessons[0];
}
