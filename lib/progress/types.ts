export interface LessonProgressRow {
  lesson_id: string;
  watched_seconds: number;
  completed: boolean;
  completed_at: string | null;
}

export interface CourseProgressResponse {
  lessons: LessonProgressRow[];
  completed_count: number;
  total_lessons: number;
  completion_percent: number;
}

export interface UpdateProgressBody {
  lesson_id: string;
  course_id: number;
  watched_seconds: number;
  completed?: boolean;
}
