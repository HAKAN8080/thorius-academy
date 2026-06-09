export type CurriculumLessonType = "video" | "text";

export interface CurriculumLesson {
  id: string;
  course_id: number;
  course_slug: string;
  wp_lesson_id: number;
  title: string;
  type: CurriculumLessonType;
  video_url: string | null;
  duration_minutes: number | null;
  content_md: string | null;
  is_free_preview: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

export interface CurriculumCourse {
  course_id: number;
  course_slug: string;
  course_title: string;
}

export interface CurriculumLessonInput {
  id?: string;
  course_id: number;
  title: string;
  type: CurriculumLessonType;
  video_url?: string | null;
  duration_minutes?: number | null;
  content_md?: string | null;
  is_free_preview: boolean;
  published: boolean;
}
