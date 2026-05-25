export type WordPressCourseWebhookEvent =
  | "course.published"
  | "course.updated"
  | "course.unpublished"
  | "course.deleted";

export interface WordPressCourseWebhookPayload {
  event: WordPressCourseWebhookEvent;
  course: {
    id: number;
    slug: string;
    previous_slug?: string;
    status: string;
    title: string;
  };
  timestamp: string;
}
