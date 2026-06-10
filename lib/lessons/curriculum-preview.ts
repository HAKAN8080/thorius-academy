import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { getLessonsForCourse } from "@/lib/actions/lesson-sync";
import { extractVideoUrl, fetchCourseFullStructure } from "@/lib/tutor/api";
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

function formatDuration(seconds: number | null): string | null {
  if (!seconds || seconds <= 0) return null;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} sa ${minutes} dk`;
  }
  return `${minutes} dk`;
}

export { formatDuration as formatLessonDuration };

function mapPreviewLesson(lesson: Lesson): CurriculumPreviewLesson {
  return {
    id: lesson.id,
    title: lesson.title,
    durationSeconds: lesson.duration_seconds,
    isFreePreview: lesson.is_free,
  };
}

function buildSectionsFromLessons(
  lessons: Lesson[],
): CurriculumPreviewSection[] {
  const grouped = new Map<string, CurriculumPreviewSection>();
  let fallbackOrder = 999;

  for (const lesson of lessons) {
    const sectionKey = lesson.section_id ?? lesson.topic_title ?? "genel";
    if (!grouped.has(sectionKey)) {
      grouped.set(sectionKey, {
        id: sectionKey,
        title: lesson.topic_title?.trim() || "Müfredat",
        sortOrder: lesson.topic_order ?? fallbackOrder++,
        lessons: [],
      });
    }
    grouped.get(sectionKey)!.lessons.push(mapPreviewLesson(lesson));
  }

  return Array.from(grouped.values()).sort((a, b) => a.sortOrder - b.sortOrder);
}

async function buildSectionsFromSupabase(
  courseSlug: string,
  lessons: Lesson[],
): Promise<CurriculumPreviewSection[]> {
  const admin = getSupabaseAdmin();
  const slugVariants = getCourseSlugLookupVariants(courseSlug);

  const { data: cacheRow } = await admin
    .from("courses_cache")
    .select("id")
    .in("course_slug", slugVariants)
    .maybeSingle();

  if (!cacheRow?.id) {
    return buildSectionsFromLessons(lessons);
  }

  const { data: sections } = await admin
    .from("sections")
    .select("id, title, sort_order")
    .eq("course_id", cacheRow.id)
    .order("sort_order", { ascending: true });

  if (!sections?.length) {
    return buildSectionsFromLessons(lessons);
  }

  const lessonsBySection = new Map<string, CurriculumPreviewLesson[]>();
  const unsectioned: CurriculumPreviewLesson[] = [];

  for (const lesson of lessons) {
    const mapped = mapPreviewLesson(lesson);
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
    title: section.title,
    sortOrder: section.sort_order,
    lessons: lessonsBySection.get(section.id) ?? [],
  }));

  if (unsectioned.length > 0) {
    result.push({
      id: "other",
      title: "Diğer",
      sortOrder: 9999,
      lessons: unsectioned,
    });
  }

  return result.filter((section) => section.lessons.length > 0);
}

export async function getCourseCurriculumPreview(
  courseId: number,
  courseSlug: string,
): Promise<CourseCurriculumPreview | null> {
  const lessons = await getLessonsForCourse(courseSlug, courseId);

  if (lessons.length > 0) {
    const sections = await buildSectionsFromSupabase(courseSlug, lessons);
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
        title: topic.topic_title,
        sortOrder: index + 1,
        lessons: topic.lessons.map((lesson) => {
          const video = extractVideoUrl(lesson.video);
          return {
            id: String(lesson.ID),
            title: lesson.post_title,
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
