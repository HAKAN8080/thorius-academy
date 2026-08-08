"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { requireCourseCacheAccess } from "@/lib/instructor/course-cache-access";
import { nextSyntheticWpLessonId } from "@/lib/instructor/next-synthetic-wp-lesson-id";
import {
  buildCurriculumTemplateBuffer,
  parseCurriculumXlsx,
} from "@/lib/instructor/curriculum-xlsx";
import { parseVideoUrl } from "@/lib/lessons/parse-video-url";
import type { BuilderLesson, CourseSection } from "@/types/instructor-course";

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

export async function downloadCurriculumTemplate(): Promise<
  | { filename: string; base64: string }
  | { error: string }
> {
  try {
    const buffer = await buildCurriculumTemplateBuffer();
    return {
      filename: "thorius-mufredat-sablonu.xlsx",
      base64: buffer.toString("base64"),
    };
  } catch {
    return { error: "Şablon oluşturulamadı." };
  }
}

export async function importCurriculumFromXlsx(
  courseCacheId: string,
  formData: FormData,
): Promise<
  | {
      sections: CourseSection[];
      lessons: BuilderLesson[];
      importedLessons: number;
      importedSections: number;
    }
  | { error: string }
> {
  try {
    const course = await requireCourseCacheAccess(courseCacheId);
    if (!course.wp_course_id) {
      return { error: "Kurs henüz hazır değil." };
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return { error: "Excel dosyası seçilmedi." };
    }

    const name = file.name.toLowerCase();
    if (!name.endsWith(".xlsx")) {
      return { error: "Yalnızca .xlsx dosyaları kabul edilir." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { error: "Dosya 5 MB’dan büyük olamaz." };
    }

    const parsed = await parseCurriculumXlsx(Buffer.from(await file.arrayBuffer()));
    if ("error" in parsed) {
      return parsed;
    }

    const admin = getSupabaseAdmin();
    const wpCourseId = course.wp_course_id;
    const slug = course.course_slug ?? `kurs-${Math.abs(wpCourseId)}`;

    const { data: existingLessons } = await admin
      .from("lessons")
      .select("id")
      .eq("course_id", wpCourseId);

    for (const row of existingLessons ?? []) {
      await admin.from("lesson_progress").delete().eq("lesson_id", row.id);
    }

    if ((existingLessons ?? []).length > 0) {
      const { error: deleteLessonsError } = await admin
        .from("lessons")
        .delete()
        .eq("course_id", wpCourseId);
      if (deleteLessonsError) {
        return { error: deleteLessonsError.message };
      }
    }

    const { error: deleteSectionsError } = await admin
      .from("sections")
      .delete()
      .eq("course_id", courseCacheId);
    if (deleteSectionsError) {
      return { error: deleteSectionsError.message };
    }

    const sectionOrder: string[] = [];
    const sectionTitleSet = new Set<string>();
    for (const row of parsed.rows) {
      if (!sectionTitleSet.has(row.sectionTitle)) {
        sectionTitleSet.add(row.sectionTitle);
        sectionOrder.push(row.sectionTitle);
      }
    }

    const sectionIdByTitle = new Map<string, string>();
    const createdSections: CourseSection[] = [];

    for (let i = 0; i < sectionOrder.length; i += 1) {
      const title = sectionOrder[i];
      const { data, error } = await admin
        .from("sections")
        .insert({
          course_id: courseCacheId,
          title,
          sort_order: i + 1,
          published: false,
        })
        .select("*")
        .single();

      if (error || !data) {
        return { error: error?.message ?? "Bölümler oluşturulamadı." };
      }

      sectionIdByTitle.set(title, data.id);
      createdSections.push(data as CourseSection);
    }

    let nextWpLessonId = await nextSyntheticWpLessonId();
    const createdLessons: BuilderLesson[] = [];

    for (let i = 0; i < parsed.rows.length; i += 1) {
      const row = parsed.rows[i];
      const sectionId = sectionIdByTitle.get(row.sectionTitle);
      if (!sectionId) {
        return { error: "Bölüm eşlemesi başarısız." };
      }

      const videoParsed =
        row.type === "video" && row.videoUrl
          ? parseVideoUrl(row.videoUrl)
          : {
              video_type: null,
              video_url: "",
              video_embed_url: null as string | null,
            };

      const { data, error } = await admin
        .from("lessons")
        .insert({
          course_id: wpCourseId,
          courses_cache_id: courseCacheId,
          section_id: sectionId,
          course_slug: slug,
          wp_lesson_id: nextWpLessonId,
          lesson_order: i + 1,
          title: row.lessonTitle,
          type: row.type,
          published: true,
          is_free: row.isFreePreview,
          topic_title: row.sectionTitle,
          topic_order: sectionOrder.indexOf(row.sectionTitle) + 1,
          video_url: row.type === "video" ? videoParsed.video_url || null : null,
          video_embed_url:
            row.type === "video" ? videoParsed.video_embed_url : null,
          video_type: row.type === "video" ? videoParsed.video_type : null,
          content_md: null,
          description: null,
        })
        .select("*")
        .single();

      if (error || !data) {
        return { error: error?.message ?? "Dersler oluşturulamadı." };
      }

      createdLessons.push(mapLesson(data as DbLessonRow));
      nextWpLessonId -= 1;
    }

    revalidateBuilderPaths(courseCacheId, course.course_slug);

    return {
      sections: createdSections,
      lessons: createdLessons,
      importedSections: createdSections.length,
      importedLessons: createdLessons.length,
    };
  } catch {
    return { error: "Müfredat içe aktarılamadı." };
  }
}
