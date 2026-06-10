export type WordPressCourseWebhookEvent =
  | "course.published"
  | "course.updated"
  | "course.unpublished"
  | "course.deleted";

export interface WordPressCourseWebhookCourse {
  id: number;
  slug: string;
  previous_slug?: string;
  status: string;
  title: string;
  wc_product_id?: number;
  price_normal?: number | null;
  price_sale?: number | null;
  is_free?: boolean;
}

export interface WordPressCourseWebhookPayload {
  event: WordPressCourseWebhookEvent;
  course: WordPressCourseWebhookCourse;
  timestamp: string;
}

export interface AcademySyncCourseToWpRequest {
  academy_course_id: string;
  title: string;
  slug: string;
  description?: string | null;
  cover_image_url?: string | null;
  category?: string | null;
  price?: number;
  sale_price?: number | null;
  instructor_wp_user_id: number;
  published: boolean;
  wp_course_id?: number | null;
}

export interface AcademySyncCourseToWpResponse {
  success: true;
  wp_course_id: number;
  wc_product_id: number | null;
  slug: string;
  status: string;
}
