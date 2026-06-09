export interface TutorLegacyEnrollment {
  course_id: number;
  course_slug: string;
  course_title: string;
  enrolled_at: string | null;
  progress_percent: number;
  completed_lesson_ids: number[];
  last_lesson_id: number | null;
  course_completed: boolean;
}

export interface TutorLegacyUserData {
  found: boolean;
  wp_user_id?: number;
  enrollments: TutorLegacyEnrollment[];
}
