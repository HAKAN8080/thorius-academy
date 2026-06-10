import { getLessonsForCourse } from "@/lib/actions/lesson-sync";
import { extractVideoUrl, fetchCourseFullStructure } from "@/lib/tutor/api";
import { groupLessonsByTopic } from "@/lib/lessons/group-by-topic";

export interface CurriculumPreviewLesson {
  title: string;
  durationSeconds: number | null;
}

export interface CurriculumPreviewTopic {
  title: string;
  lessons: CurriculumPreviewLesson[];
}

export interface CourseCurriculumPreview {
  topics: CurriculumPreviewTopic[];
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

export async function getCourseCurriculumPreview(
  courseId: number,
  courseSlug: string,
): Promise<CourseCurriculumPreview | null> {
  const lessons = await getLessonsForCourse(courseSlug, courseId);

  if (lessons.length > 0) {
    const topics = groupLessonsByTopic(lessons).map((topic) => ({
      title: topic.topic_title,
      lessons: topic.lessons.map((lesson) => ({
        title: lesson.title,
        durationSeconds: lesson.duration_seconds,
      })),
    }));

    const totalDurationSeconds = lessons.reduce(
      (sum, lesson) => sum + (lesson.duration_seconds ?? 0),
      0,
    );

    return {
      topics,
      totalLessons: lessons.length,
      totalDurationSeconds,
    };
  }

  try {
    const tutorTopics = await fetchCourseFullStructure(courseId);
    if (tutorTopics.length === 0) return null;

    const topics: CurriculumPreviewTopic[] = tutorTopics.map((topic) => ({
      title: topic.topic_title,
      lessons: topic.lessons.map((lesson) => {
        const video = extractVideoUrl(lesson.video);
        return {
          title: lesson.post_title,
          durationSeconds: video.duration > 0 ? video.duration : null,
        };
      }),
    }));

    const allLessons = topics.flatMap((topic) => topic.lessons);

    return {
      topics,
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
