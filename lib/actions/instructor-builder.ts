"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { requireCourseCacheAccess } from "@/lib/instructor/course-cache-access";
import { nextSyntheticWpLessonId } from "@/lib/instructor/next-synthetic-wp-lesson-id";
import { resolveLessonVideoForSave } from "@/lib/video/resolve-lesson-video";
import { resolveVideoDurationSeconds } from "@/lib/lessons/video-duration";
import type {
  BuilderLesson,
  BuilderLessonInput,
  CourseSection,
} from "@/types/instructor-course";

interface DbLessonRow {
  id: string;
  course_id: number;
  courses_cache_id: string | null;
  section_id: string | null;
  course_slug: string;
  wp_lesson_id: number;
  lesson_order: number;
  title: string;
  type: "video" | "text" | null;
  video_url: string | null;
  content_md: string | null;
  featured_image_url: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  excel_attachment_url: string | null;
  excel_attachment_name: string | null;
  duration_seconds: number | null;
  duration_minutes: number | null;
  is_free: boolean;
  published: boolean | null;
}

function splitDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

function combineDuration(hours: number, minutes: number, seconds: number) {
  return Math.max(0, hours) * 3600 + Math.max(0, minutes) * 60 + Math.max(0, seconds);
}

function mapLesson(row: DbLessonRow): BuilderLesson {
  const totalSeconds =
    row.duration_seconds ??
    (row.duration_minutes ? row.duration_minutes * 60 : 0);
  const parts = splitDuration(totalSeconds);

  return {
    id: row.id,
    course_id: row.course_id,
    courses_cache_id: row.courses_cache_id,
    section_id: row.section_id,
    course_slug: row.course_slug,
    wp_lesson_id: row.wp_lesson_id,
    title: row.title,
    type: row.type === "text" ? "text" : "video",
    video_url: row.video_url,
    content_md: row.content_md,
    featured_image_url: row.featured_image_url,
    attachment_url: row.attachment_url,
    attachment_name: row.attachment_name,
    excel_attachment_url: row.excel_attachment_url,
    excel_attachment_name: row.excel_attachment_name,
    duration_hours: parts.hours,
    duration_minutes: parts.minutes,
    duration_seconds: parts.seconds,
    is_free_preview: row.is_free,
    published: row.published ?? true,
    sort_order: row.lesson_order,
  };
}

function revalidateBuilderPaths(courseCacheId: string, courseSlug: string | null) {
  revalidatePath(`/instructor/courses/${courseCacheId}/curriculum`);
  if (courseSlug) {
    for (const slug of getCourseSlugLookupVariants(courseSlug)) {
      revalidatePath(`/panel/kurslarim/${slug}`);
    }
  }
}

export async function getBuilderCurriculum(courseCacheId: string): Promise<
  | {
      sections: CourseSection[];
      lessons: BuilderLesson[];
      courseSlug: string | null;
      wpCourseId: number | null;
    }
  | { error: string }
> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();

    const [{ data: sections }, { data: lessons }] = await Promise.all([
      admin
        .from("sections")
        .select("*")
        .eq("course_id", courseCacheId)
        .order("sort_order", { ascending: true }),
      course.wp_course_id
        ? admin
            .from("lessons")
            .select("*")
            .eq("course_id", course.wp_course_id)
            .order("lesson_order", { ascending: true })
        : Promise.resolve({ data: [] as DbLessonRow[], error: null }),
    ]);

    return {
      sections: (sections ?? []) as CourseSection[],
      lessons: ((lessons ?? []) as DbLessonRow[]).map(mapLesson),
      courseSlug: course.course_slug,
      wpCourseId: course.wp_course_id,
    };
  } catch {
    return { error: "Müfredat yüklenemedi." };
  }
}

export async function createSection(
  courseCacheId: string,
  title = "Yeni Bölüm",
): Promise<{ section: CourseSection } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();

    const { data: last } = await admin
      .from("sections")
      .select("sort_order")
      .eq("course_id", courseCacheId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data, error } = await admin
      .from("sections")
      .insert({
        course_id: courseCacheId,
        title,
        sort_order: (last?.sort_order ?? 0) + 1,
        published: false,
      })
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Bölüm oluşturulamadı" };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { section: data as CourseSection };
  } catch {
    return { error: "Bölüm oluşturulamadı" };
  }
}

export async function updateSectionTitle(
  sectionId: string,
  courseCacheId: string,
  title: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();
    const { error } = await admin
      .from("sections")
      .update({ title: title.trim() })
      .eq("id", sectionId)
      .eq("course_id", courseCacheId);

    if (error) {
      return { error: error.message };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { success: true };
  } catch {
    return { error: "Güncellenemedi" };
  }
}

export async function deleteSection(
  sectionId: string,
  courseCacheId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();

    if (course.wp_course_id) {
      const { data: sectionLessons } = await admin
        .from("lessons")
        .select("id")
        .eq("course_id", course.wp_course_id)
        .eq("section_id", sectionId);

      for (const row of sectionLessons ?? []) {
        await admin.from("lesson_progress").delete().eq("lesson_id", row.id);
        await admin
          .from("lessons")
          .delete()
          .eq("id", row.id)
          .eq("course_id", course.wp_course_id);
      }
    }

    const { error } = await admin
      .from("sections")
      .delete()
      .eq("id", sectionId)
      .eq("course_id", courseCacheId);

    if (error) {
      return { error: error.message };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { success: true };
  } catch {
    return { error: "Silinemedi" };
  }
}

export async function reorderSections(
  courseCacheId: string,
  orderedSectionIds: string[],
): Promise<{ success: true } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    const admin = getSupabaseAdmin();

    await Promise.all(
      orderedSectionIds.map((id, index) =>
        admin
          .from("sections")
          .update({ sort_order: index + 1 })
          .eq("id", id)
          .eq("course_id", courseCacheId),
      ),
    );

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { success: true };
  } catch {
    return { error: "Sıralama kaydedilemedi" };
  }
}

export async function createBuilderLesson(
  courseCacheId: string,
  sectionId: string,
): Promise<{ lesson: BuilderLesson } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    if (!course.wp_course_id) {
      return { error: "Kurs henüz hazır değil." };
    }

    const admin = getSupabaseAdmin();
    const { data: last } = await admin
      .from("lessons")
      .select("lesson_order")
      .eq("course_id", course.wp_course_id)
      .order("lesson_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const wpLessonId = await nextSyntheticWpLessonId();
    const slug = course.course_slug ?? `kurs-${Math.abs(course.wp_course_id)}`;

    const { data, error } = await admin
      .from("lessons")
      .insert({
        course_id: course.wp_course_id,
        courses_cache_id: courseCacheId,
        section_id: sectionId,
        course_slug: slug,
        wp_lesson_id: wpLessonId,
        lesson_order: (last?.lesson_order ?? 0) + 1,
        title: "Yeni Ders",
        type: "video",
        published: true,
        is_free: false,
        topic_title: "Müfredat",
        topic_order: 1,
      })
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Ders oluşturulamadı" };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { lesson: mapLesson(data as DbLessonRow) };
  } catch {
    return { error: "Ders oluşturulamadı" };
  }
}

export async function saveBuilderLesson(
  input: BuilderLessonInput,
): Promise<{ lesson: BuilderLesson } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(input.course_cache_id);
    if (!course.wp_course_id) {
      return { error: "Geçersiz kurs" };
    }

    if (!input.title.trim()) {
      return { error: "Ders adı zorunludur" };
    }

    const admin = getSupabaseAdmin();

    const courseSlug =
      course.course_slug ?? `kurs-${Math.abs(course.wp_course_id)}`;

    const { data: section } = input.section_id
      ? await admin
          .from("sections")
          .select("title, sort_order")
          .eq("id", input.section_id)
          .maybeSingle()
      : { data: null };

    const payload: Record<string, unknown> = {
      title: input.title.trim(),
      type: input.type,
      section_id: input.section_id,
      course_slug: courseSlug,
      is_free: input.is_free_preview,
      published: input.published,
      featured_image_url: input.featured_image_url?.trim() || null,
      attachment_url: input.attachment_url?.trim() || null,
      attachment_name: input.attachment_name?.trim() || null,
      excel_attachment_url: input.excel_attachment_url?.trim() || null,
      excel_attachment_name: input.excel_attachment_name?.trim() || null,
      updated_at: new Date().toISOString(),
    };

    if (section?.title) {
      payload.topic_title = section.title;
      payload.topic_order = section.sort_order ?? 1;
    }

    if (input.type === "text") {
      payload.content_md = input.content_md ?? "";
      payload.description = input.content_md ?? null;
      payload.video_url = null;
      payload.video_embed_url = null;
      payload.video_type = null;
      payload.duration_seconds = null;
      payload.duration_minutes = null;
    } else {
      const resolved = await resolveLessonVideoForSave(
        input.video_url?.trim() ?? "",
        input.title.trim(),
        {
          courseTitle: course.title,
          courseSlug: course.course_slug,
          wpCourseId: course.wp_course_id,
        },
      );
      if ("error" in resolved) {
        return { error: resolved.error };
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
      const manualSeconds = combineDuration(
        input.duration_hours ?? 0,
        input.duration_minutes ?? 0,
        input.duration_seconds ?? 0,
      );
      const totalSeconds = detectedSeconds ?? (manualSeconds > 0 ? manualSeconds : null);

      if (totalSeconds != null) {
        payload.duration_seconds = totalSeconds;
        payload.duration_minutes = Math.max(1, Math.round(totalSeconds / 60));
      }

      if (
        !input.published &&
        (parsed.video_url || input.content_md?.trim()) &&
        course.published
      ) {
        payload.published = true;
      }
    }

    const { data, error } = await admin
      .from("lessons")
      .update(payload)
      .eq("id", input.id)
      .eq("course_id", course.wp_course_id)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Kaydedilemedi" };
    }

    revalidateBuilderPaths(input.course_cache_id, course.course_slug);
    return { lesson: mapLesson(data as DbLessonRow) };
  } catch {
    return { error: "Kaydedilemedi" };
  }
}

export async function reorderBuilderLessons(
  courseCacheId: string,
  orderedLessonIds: string[],
): Promise<{ success: true } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    if (!course.wp_course_id) {
      return { error: "Geçersiz kurs" };
    }

    const admin = getSupabaseAdmin();
    await Promise.all(
      orderedLessonIds.map((id, index) =>
        admin
          .from("lessons")
          .update({ lesson_order: index + 1 })
          .eq("id", id)
          .eq("course_id", course.wp_course_id),
      ),
    );

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { success: true };
  } catch {
    return { error: "Sıralama kaydedilemedi" };
  }
}

export async function toggleBuilderLessonPublished(
  courseCacheId: string,
  lessonId: string,
  published: boolean,
): Promise<{ lesson: BuilderLesson } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    if (!course.wp_course_id) {
      return { error: "Geçersiz kurs" };
    }

    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("lessons")
      .update({ published, updated_at: new Date().toISOString() })
      .eq("id", lessonId)
      .eq("course_id", course.wp_course_id)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Güncellenemedi" };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { lesson: mapLesson(data as DbLessonRow) };
  } catch {
    return { error: "Güncellenemedi" };
  }
}

export async function deleteBuilderLesson(
  courseCacheId: string,
  lessonId: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    if (!course.wp_course_id) {
      return { error: "Geçersiz kurs" };
    }

    const admin = getSupabaseAdmin();
    await admin.from("lesson_progress").delete().eq("lesson_id", lessonId);

    const { error } = await admin
      .from("lessons")
      .delete()
      .eq("id", lessonId)
      .eq("course_id", course.wp_course_id);

    if (error) {
      return { error: error.message };
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);
    return { success: true };
  } catch {
    return { error: "Ders silinemedi" };
  }
}
