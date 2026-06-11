"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import {
  requireCurriculumAccess,
  verifyInstructorCourseAccess,
} from "@/lib/instructor/curriculum-access";
import { nextSyntheticWpLessonId } from "@/lib/instructor/next-synthetic-wp-lesson-id";
import { resolveLessonVideoForSave } from "@/lib/video/resolve-lesson-video";
import { resolveVideoDurationSeconds } from "@/lib/lessons/video-duration";
import type {
  CurriculumCourse,
  CurriculumLesson,
  CurriculumLessonInput,
} from "@/types/curriculum";

interface DbLessonRow {
  id: string;
  course_id: number;
  course_slug: string;
  wp_lesson_id: number;
  lesson_order: number;
  title: string;
  type: "video" | "text" | null;
  video_url: string | null;
  duration_minutes: number | null;
  duration_seconds: number | null;
  content_md: string | null;
  description: string | null;
  is_free: boolean;
  published: boolean | null;
  created_at: string;
}

function mapLessonRow(row: DbLessonRow): CurriculumLesson {
  return {
    id: row.id,
    course_id: row.course_id,
    course_slug: row.course_slug,
    wp_lesson_id: row.wp_lesson_id,
    title: row.title,
    type: row.type === "text" ? "text" : "video",
    video_url: row.video_url,
    duration_minutes:
      row.duration_minutes ??
      (row.duration_seconds
        ? Math.max(1, Math.round(row.duration_seconds / 60))
        : null),
    content_md: row.content_md ?? row.description,
    is_free_preview: row.is_free,
    published: row.published ?? true,
    sort_order: row.lesson_order,
    created_at: row.created_at,
  };
}

async function getAuthorizedCourse(
  courseId: number,
): Promise<CurriculumCourse | { error: string }> {
  const access = await requireCurriculumAccess();
  const course = await verifyInstructorCourseAccess(courseId, access);

  if (!course) {
    return { error: "Bu kursa erişim yetkiniz yok." };
  }

  return {
    course_id: courseId,
    course_slug: course.course_slug,
    course_title: course.course_title,
  };
}

function revalidateCurriculumPaths(courseId: number, courseSlug: string) {
  revalidatePath(`/instructor/courses/${courseId}/curriculum`);
  for (const slug of getCourseSlugLookupVariants(courseSlug)) {
    revalidatePath(`/panel/kurslarim/${slug}`);
  }
}

export async function getCurriculumLessons(
  courseId: number,
): Promise<{ lessons: CurriculumLesson[] } | { error: string }> {
  const courseResult = await getAuthorizedCourse(courseId);
  if ("error" in courseResult) {
    return courseResult;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("lesson_order", { ascending: true });

  if (error) {
    return { error: error.message };
  }

  return {
    lessons: ((data ?? []) as DbLessonRow[]).map(mapLessonRow),
  };
}

export async function createCurriculumLesson(
  courseId: number,
): Promise<{ lesson: CurriculumLesson } | { error: string }> {
  const courseResult = await getAuthorizedCourse(courseId);
  if ("error" in courseResult) {
    return courseResult;
  }

  const admin = getSupabaseAdmin();
  const { data: lastLesson } = await admin
    .from("lessons")
    .select("lesson_order")
    .eq("course_id", courseId)
    .order("lesson_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (lastLesson?.lesson_order ?? 0) + 1;
  const wpLessonId = await nextSyntheticWpLessonId();

  const { data, error } = await admin
    .from("lessons")
    .insert({
      course_id: courseId,
      course_slug: courseResult.course_slug,
      wp_lesson_id: wpLessonId,
      lesson_order: nextOrder,
      title: "Yeni Ders",
      type: "video",
      published: false,
      is_free: false,
      topic_title: "Müfredat",
      topic_order: 1,
    })
    .select("*")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Ders oluşturulamadı." };
  }

  revalidateCurriculumPaths(courseId, courseResult.course_slug);
  return { lesson: mapLessonRow(data as DbLessonRow) };
}

export async function saveCurriculumLesson(
  input: CurriculumLessonInput,
): Promise<{ lesson: CurriculumLesson } | { error: string }> {
  const courseResult = await getAuthorizedCourse(input.course_id);
  if ("error" in courseResult) {
    return courseResult;
  }

  if (!input.title.trim()) {
    return { error: "Ders başlığı zorunludur." };
  }

  const admin = getSupabaseAdmin();
  const payload: Record<string, unknown> = {
    title: input.title.trim(),
    type: input.type,
    is_free: input.is_free_preview,
    published: input.published,
    updated_at: new Date().toISOString(),
  };

  if (input.type === "text") {
    payload.content_md = input.content_md?.trim() || "";
    payload.description = input.content_md?.trim() || null;
    payload.video_url = null;
    payload.video_embed_url = null;
    payload.video_type = null;
    payload.duration_minutes = null;
    payload.duration_seconds = null;
  } else {
    const resolved = await resolveLessonVideoForSave(
      input.video_url?.trim() ?? "",
      input.title.trim(),
      {
        courseTitle: courseResult.course_title,
        courseSlug: courseResult.course_slug,
        wpCourseId: courseResult.course_id,
      },
    );
    if ("error" in resolved) {
      return resolved;
    }

    const parsed = {
      video_url: resolved.video_url,
      video_embed_url: resolved.video_embed_url,
      video_type: resolved.video_type,
    };
    payload.video_url = parsed.video_url || null;
    payload.video_embed_url = parsed.video_embed_url;
    payload.video_type = parsed.video_type;
    payload.content_md = null;
    payload.description = null;

    const detectedSeconds = parsed.video_url
      ? await resolveVideoDurationSeconds(parsed)
      : null;
    const manualMinutes =
      typeof input.duration_minutes === "number" && input.duration_minutes > 0
        ? Math.floor(input.duration_minutes)
        : null;
    const totalSeconds =
      detectedSeconds ?? (manualMinutes ? manualMinutes * 60 : null);

    if (totalSeconds != null) {
      payload.duration_seconds = totalSeconds;
      payload.duration_minutes = Math.max(1, Math.round(totalSeconds / 60));
    }
  }

  let query = admin.from("lessons").update(payload).eq("course_id", input.course_id);

  if (input.id) {
    query = query.eq("id", input.id);
  } else {
    return { error: "Ders kimliği gerekli." };
  }

  const { data, error } = await query.select("*").single();

  if (error || !data) {
    return { error: error?.message ?? "Ders kaydedilemedi." };
  }

  revalidateCurriculumPaths(input.course_id, courseResult.course_slug);
  return { lesson: mapLessonRow(data as DbLessonRow) };
}

export async function reorderCurriculumLessons(
  courseId: number,
  orderedLessonIds: string[],
): Promise<{ success: true } | { error: string }> {
  const courseResult = await getAuthorizedCourse(courseId);
  if ("error" in courseResult) {
    return courseResult;
  }

  const admin = getSupabaseAdmin();
  const updates = orderedLessonIds.map((lessonId, index) =>
    admin
      .from("lessons")
      .update({
        lesson_order: index + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", lessonId)
      .eq("course_id", courseId),
  );

  const results = await Promise.all(updates);
  const failed = results.find((result) => result.error);
  if (failed?.error) {
    return { error: failed.error.message };
  }

  revalidateCurriculumPaths(courseId, courseResult.course_slug);
  return { success: true };
}

export async function toggleCurriculumLessonPublished(
  lessonId: string,
  courseId: number,
  published: boolean,
): Promise<{ lesson: CurriculumLesson } | { error: string }> {
  const courseResult = await getAuthorizedCourse(courseId);
  if ("error" in courseResult) {
    return courseResult;
  }

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lessons")
    .update({
      published,
      updated_at: new Date().toISOString(),
    })
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .select("*")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Yayın durumu güncellenemedi." };
  }

  revalidateCurriculumPaths(courseId, courseResult.course_slug);
  return { lesson: mapLessonRow(data as DbLessonRow) };
}

export async function getCurriculumCourse(
  courseId: number,
): Promise<CurriculumCourse | { error: string }> {
  return getAuthorizedCourse(courseId);
}
