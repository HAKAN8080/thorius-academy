export interface Enrollment {
  id: string;
  user_id: string;
  course_id: number;
  course_slug: string;
  course_title: string;
  course_image: string | null;
  course_category: string | null;
  instructor_name: string | null;
  enrolled_at: string;
  progress: number;
  completed_at: string | null;
  last_lesson_id: number | null;
  status: "active" | "completed" | "cancelled";
}

export interface EnrollResult {
  success: boolean;
  error?: string;
  needsLogin?: boolean;
  alreadyEnrolled?: boolean;
  enrollment?: Enrollment;
}
