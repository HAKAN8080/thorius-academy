export interface Instructor {
  wp_user_id: number;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  synced_at: string;
}

export interface InstructorCourseStats {
  wp_course_id: number;
  course_slug: string;
  instructor_wp_user_id: number;
  title: string;
  image_url: string | null;
  status: string;
  enrollment_count: number;
  rating_avg: number;
  rating_count: number;
  published_at: string | null;
  synced_at: string;
}

export interface InstructorCourseReview {
  id: string;
  wp_course_id: number;
  wp_review_id: number;
  student_name: string | null;
  rating: number | null;
  review_text: string | null;
  reviewed_at: string | null;
  synced_at: string;
}

export interface SyncInstructorStatsResult {
  success: boolean;
  coursesSynced?: number;
  statsCoursesUpserted?: number;
  reviewsSynced?: number;
  instructorsSynced?: number;
  accountsLinked?: number;
  accountsCreated?: number;
  inviteEmailsSent?: number;
  courseSource?: "tutor-api" | "wp-rest" | "merged";
  wpCoursesFetched?: number;
  tutorCoursesFetched?: number;
  instructorIds?: number[];
  syncErrors?: string[];
  warning?: string;
  error?: string;
}
