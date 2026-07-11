import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import {
  resolveCurriculumSectionTitle,
  resolveCurriculumTitle,
} from "@/lib/course/pilot-curriculum-content-en";
import { getLessonsForCourse } from "@/lib/actions/lesson-sync";
import { extractVideoUrl, fetchCourseFullStructure } from "@/lib/tutor/api";
import type { AppLocale } from "@/i18n/routing";
import type { Lesson } from "@/types/lesson";

export interface CurriculumPreviewLesson {
  id: string;
  title: string;
  durationSeconds: number | null;
  isFreePreview: boolean;
}

export interface CurriculumPreviewSection {
  id: string;
  title: string;
  sortOrder: number;
  lessons: CurriculumPreviewLesson[];
}

export interface CourseCurriculumPreview {
  sections: CurriculumPreviewSection[];
  totalLessons: number;
  totalDurationSeconds: number;
}

function formatDuration(
  seconds: number | null,
  locale: string = "tr",
): string | null {
  if (!seconds || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const isEn = locale === "en";

  if (hours > 0) {
    if (isEn) {
      return `${hours} hr ${minutes} min`;
    }
    return `${hours} sa ${minutes} dk`;
  }

  return isEn ? `${minutes} min` : `${minutes} dk`;
}

export function formatLessonDuration(
  seconds: number | null,
  locale: string = "tr",
): string | null {
  return formatDuration(seconds, locale);
}

function mapPreviewLesson(
  lesson: Lesson & { title_en?: string | null },
  locale: AppLocale,
  courseSlug: string,
): CurriculumPreviewLesson {
  return {
    id: lesson.id,
    title: resolveCurriculumTitle(
      locale,
      courseSlug,
      lesson.title,
      lesson.title_en,
    ),
    durationSeconds: lesson.duration_seconds,
    isFreePreview: lesson.is_free,
  };
}

function buildSectionsFromLessons(
  lessons: Array<Lesson & { title_en?: string | null }>,
  locale: AppLocale,
  courseSlug: string,
): CurriculumPreviewSection[] {
  const grouped = new Map<string, CurriculumPreviewSection>();
  let fallbackOrder = 999;

  for (const lesson of lessons) {
    const sectionKey = lesson.section_id ?? lesson.topic_title ?? "genel";
    if (!grouped.has(sectionKey)) {
      const trSectionTitle = lesson.topic_title?.trim() || "Müfredat";
      grouped.set(sectionKey, {
        id: sectionKey,
        title: resolveCurriculumSectionTitle(
          locale,
          courseSlug,
          trSectionTitle,
        ),
        sortOrder: lesson.topic_order ?? fallbackOrder++,
        lessons: [],
      });
    }
    grouped.get(sectionKey)!.lessons.push(
      mapPreviewLesson(lesson, locale, courseSlug),
    );
  }

  return Array.from(grouped.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

async function buildSectionsFromSupabase(
  courseSlug: string,
  lessons: Array<Lesson & { title_en?: string | null }>,
  locale: AppLocale,
): Promise<CurriculumPreviewSection[]> {
  const admin = getSupabaseAdmin();
  const slugVariants = getCourseSlugLookupVariants(courseSlug);

  const { data: cacheRow } = await admin
    .from("courses_cache")
    .select("id")
    .in("course_slug", slugVariants)
    .maybeSingle();

  if (!cacheRow?.id) {
    return buildSectionsFromLessons(lessons, locale, courseSlug);
  }

  const { data: sections } = await admin
    .from("sections")
    .select("id, title, sort_order")
    .eq("course_id", cacheRow.id)
    .order("sort_order", { ascending: true });

  if (!sections?.length) {
    return buildSectionsFromLessons(lessons, locale, courseSlug);
  }

  const lessonsBySection = new Map<string, CurriculumPreviewLesson[]>();
  const unsectioned: CurriculumPreviewLesson[] = [];

  for (const lesson of lessons) {
    const mapped = mapPreviewLesson(lesson, locale, courseSlug);
    if (lesson.section_id) {
      const bucket = lessonsBySection.get(lesson.section_id) ?? [];
      bucket.push(mapped);
      lessonsBySection.set(lesson.section_id, bucket);
    } else {
      unsectioned.push(mapped);
    }
  }

  const result: CurriculumPreviewSection[] = sections.map((section) => ({
    id: section.id,
    title: resolveCurriculumSectionTitle(locale, courseSlug, section.title),
    sortOrder: section.sort_order,
    lessons: lessonsBySection.get(section.id) ?? [],
  }));

  if (unsectioned.length > 0) {
    result.push({
      id: "other",
      title: resolveCurriculumSectionTitle(locale, courseSlug, "Diğer"),
      sortOrder: 9999,
      lessons: unsectioned,
    });
  }

  return result.filter((section) => section.lessons.length > 0);
}

export async function getCourseCurriculumPreview(
  courseId: number,
  courseSlug: string,
  locale: AppLocale = "tr",
): Promise<CourseCurriculumPreview | null> {
  const lessons = await getLessonsForCourse(courseSlug, courseId);

  if (lessons.length > 0) {
    const sections = await buildSectionsFromSupabase(
      courseSlug,
      lessons,
      locale,
    );
    const totalDurationSeconds = lessons.reduce(
      (sum, lesson) => sum + (lesson.duration_seconds ?? 0),
      0,
    );

    return {
      sections,
      totalLessons: lessons.length,
      totalDurationSeconds,
    };
  }

  try {
    const tutorTopics = await fetchCourseFullStructure(courseId);
    if (tutorTopics.length === 0) return null;

    const sections: CurriculumPreviewSection[] = tutorTopics.map(
      (topic, index) => ({
        id: String(topic.topic_id),
        title: resolveCurriculumSectionTitle(
          locale,
          courseSlug,
          topic.topic_title,
        ),
        sortOrder: index + 1,
        lessons: topic.lessons.map((lesson) => {
          const video = extractVideoUrl(lesson.video);
          return {
            id: String(lesson.ID),
            title: resolveCurriculumTitle(
              locale,
              courseSlug,
              lesson.post_title,
            ),
            durationSeconds: video.duration > 0 ? video.duration : null,
            isFreePreview: false,
          };
        }),
      }),
    );

    const allLessons = sections.flatMap((section) => section.lessons);

    return {
      sections,
      totalLessons: allLessons.length,
      totalDurationSeconds: allLessons.reduce(
        (sum, lesson) => sum + (lesson.durationSeconds ?? 0),
        0,
      ),
    };
  } catch {
    return null;
  }
}
