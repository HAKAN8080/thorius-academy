export const PROGRESS_SAVE_INTERVAL_MS = 30_000;
export const PROGRESS_COMPLETION_THRESHOLD = 0.9;
export const PROGRESS_DEBOUNCE_MS = 500;

export async function postLessonProgress(payload: {
  lesson_id: string;
  course_id: number;
  watched_seconds: number;
  completed?: boolean;
}) {
  const response = await fetch("/api/progress/update", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Progress update failed");
  }
}

export function dispatchCourseProgressRefresh(courseId: number) {
  window.dispatchEvent(
    new CustomEvent("course-progress-refresh", {
      detail: { courseId },
    }),
  );
}
