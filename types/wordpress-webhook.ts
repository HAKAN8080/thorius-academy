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
