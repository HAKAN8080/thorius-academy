import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertLessonProgress } from "@/lib/progress/lesson-progress-service";
import type { UpdateProgressBody } from "@/lib/progress/types";

export const dynamic = "force-dynamic";

function parseBody(value: unknown): UpdateProgressBody | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const body = value as Record<string, unknown>;
  const lessonId = body.lesson_id;
  const courseId = body.course_id;
  const watchedSeconds = body.watched_seconds;
  const completed = body.completed;

  if (typeof lessonId !== "string" || !lessonId.trim()) {
    return null;
  }

  const parsedCourseId =
    typeof courseId === "number" ? courseId : parseInt(String(courseId), 10);

  if (!Number.isFinite(parsedCourseId)) {
    return null;
  }

  const parsedWatchedSeconds =
    typeof watchedSeconds === "number"
      ? watchedSeconds
      : parseInt(String(watchedSeconds), 10);

  if (!Number.isFinite(parsedWatchedSeconds) || parsedWatchedSeconds < 0) {
    return null;
  }

  return {
    lesson_id: lessonId,
    course_id: parsedCourseId,
    watched_seconds: Math.floor(parsedWatchedSeconds),
    completed: typeof completed === "boolean" ? completed : undefined,
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const body = parseBody(json);
  if (!body) {
    return NextResponse.json(
      { error: "lesson_id, course_id and watched_seconds are required" },
      { status: 400 },
    );
  }

  const courseSlug =
    typeof (json as Record<string, unknown>).course_slug === "string"
      ? ((json as Record<string, unknown>).course_slug as string)
      : undefined;
  const wpLessonIdRaw = (json as Record<string, unknown>).wp_lesson_id;
  const wpLessonId =
    typeof wpLessonIdRaw === "number"
      ? wpLessonIdRaw
      : parseInt(String(wpLessonIdRaw ?? ""), 10);

  const result = await upsertLessonProgress(user.id, body, {
    courseSlug,
    wpLessonId: Number.isFinite(wpLessonId) ? wpLessonId : undefined,
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
