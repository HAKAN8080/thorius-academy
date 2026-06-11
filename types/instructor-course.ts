export type CoursePricingModel = "free" | "paid";
export type CourseVisibility = "public" | "private";
export type CourseBuilderStep =
  | "basics"
  | "curriculum"
  | "additional"
  | "students";

export interface CoursesCache {
  id: string;
  wp_course_id: number | null;
  instructor_wp_user_id: number;
  course_slug: string | null;
  title: string;
  subtitle: string | null;
  description_md: string | null;
  cover_image_url: string | null;
  intro_video_url: string | null;
  pricing_model: CoursePricingModel;
  price: number;
  sale_price: number | null;
  level: string;
  language: string;
  category: string | null;
  visibility: CourseVisibility;
  what_will_learn: string | null;
  target_audience: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_focus_keyword: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  published: boolean;
  created_at: string;
}

export interface BuilderLesson {
  id: string;
  course_id: number;
  courses_cache_id: string | null;
  section_id: string | null;
  course_slug: string;
  wp_lesson_id: number;
  title: string;
  type: "video" | "text";
  video_url: string | null;
  content_md: string | null;
  featured_image_url: string | null;
  attachment_url: string | null;
  attachment_name: string | null;
  duration_hours: number;
  duration_minutes: number;
  duration_seconds: number;
  is_free_preview: boolean;
  published: boolean;
  sort_order: number;
}

export interface InstructorDashboardStats {
  totalCourses: number;
  activeCourses: number;
  totalStudents: number;
  totalEarnings: number;
}

export interface InstructorCourseListItem {
  id: string;
  wp_course_id: number | null;
  title: string;
  cover_image_url: string | null;
  enrollment_count: number;
  earnings_total: number;
  published: boolean;
  course_slug: string | null;
  status: string;
  published_at: string | null;
  rating_avg: number;
  rating_count: number;
}

export interface CourseBasicsInput {
  title: string;
  course_slug?: string | null;
  subtitle?: string | null;
  description_md?: string | null;
  cover_image_url?: string | null;
  intro_video_url?: string | null;
  pricing_model: CoursePricingModel;
  price?: number;
  sale_price?: number | null;
  level?: string;
  language?: string;
  category?: string | null;
  visibility: CourseVisibility;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_focus_keyword?: string | null;
  published: boolean;
}

export interface CourseAdditionalInput {
  what_will_learn?: string | null;
  target_audience?: string | null;
}

export interface BuilderLessonInput {
  id: string;
  course_cache_id: string;
  section_id: string | null;
  title: string;
  type: "video" | "text";
  video_url?: string | null;
  content_md?: string | null;
  featured_image_url?: string | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
  duration_hours?: number;
  duration_minutes?: number;
  duration_seconds?: number;
  is_free_preview: boolean;
  published: boolean;
}
