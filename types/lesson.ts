export interface Lesson {
  id: string;
  course_id: number;
  course_slug: string;
  wp_lesson_id: number;
  lesson_order: number;
  title: string;
  description: string | null;
  duration_seconds: number | null;
  video_type: "external_url" | "youtube" | "html5" | "vimeo" | null;
  video_url: string | null;
  video_embed_url: string | null;
  topic_title: string | null;
  topic_order: number | null;
  is_free: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: number;
  watched_seconds: number;
  completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

export interface LessonWithProgress extends Lesson {
  progress?: LessonProgress;
}

export interface CourseWithLessons {
  course_id: number;
  course_slug: string;
  total_lessons: number;
  total_duration_seconds: number;
  topics: {
    topic_id: number;
    topic_title: string;
    topic_order: number;
    lessons: LessonWithProgress[];
  }[];
}
