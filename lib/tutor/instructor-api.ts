import { tutorFetch, TUTOR_API_BASE } from "@/lib/tutor/api";
import type { TutorApiResponse } from "@/types/tutor";

export interface TutorCourseListItem {
  ID: number;
  post_author: number | string;
  post_title: string;
  post_name: string;
  post_status: string;
  post_date: string;
  post_date_gmt?: string;
  thumbnail?: string;
  thumbnail_url?: string;
  image?: string;
  total_enrolled?: number;
  enrollment_count?: number;
}

export interface TutorCourseDetail extends TutorCourseListItem {
  total_enrolled?: number;
  course_rating?: {
    rating_avg?: number | string;
    rating_count?: number | string;
    count?: number | string;
  };
}

export interface TutorCourseRating {
  course_id?: number;
  rating_avg?: number | string;
  rating_count?: number | string;
  rating?: number | string;
  count?: number | string;
  reviews?: TutorReviewItem[];
}

export interface TutorReviewItem {
  review_id?: number;
  comment_ID?: number;
  ID?: number;
  id?: number;
  user_id?: number;
  user_name?: string;
  display_name?: string;
  student_name?: string;
  rating?: number | string;
  review?: string;
  review_content?: string;
  comment_content?: string;
  content?: string;
  review_title?: string;
  post_date?: string;
  post_date_gmt?: string;
  created_at?: string;
}

export interface TutorAuthorInfo {
  ID?: number;
  id?: number;
  user_email?: string;
  email?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  avatar?: string;
}

export interface WpComment {
  id: number;
  post: number;
  author_name: string;
  content: { rendered: string };
  date: string;
  meta?: Record<string, unknown>;
}

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

function parseNumber(value: unknown): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

function normalizeCourseItem(raw: unknown): TutorCourseListItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    ID: parseNumber(item.ID ?? item.id),
    post_author: (item.post_author ?? item.author ?? item.instructor_id ?? 0) as
      | number
      | string,
    post_title: String(item.post_title ?? item.title ?? ""),
    post_name: String(item.post_name ?? item.slug ?? ""),
    post_status: String(item.post_status ?? item.status ?? "publish"),
    post_date: String(item.post_date ?? item.date ?? item.last_updated ?? ""),
    post_date_gmt:
      typeof item.post_date_gmt === "string" ? item.post_date_gmt : undefined,
    thumbnail: typeof item.thumbnail === "string" ? item.thumbnail : undefined,
    thumbnail_url:
      typeof (item.thumbnail_url ?? item.image) === "string"
        ? String(item.thumbnail_url ?? item.image)
        : undefined,
    image: typeof item.image === "string" ? item.image : undefined,
    total_enrolled: parseNumber(item.total_enrolled) || undefined,
    enrollment_count: parseNumber(item.enrollment_count) || undefined,
  };
}

function extractCourseList(data: unknown): TutorCourseListItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return data.map(normalizeCourseItem);

  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.results)) {
      return obj.results.map(normalizeCourseItem);
    }
    if (Array.isArray(obj.courses)) {
      return obj.courses.map(normalizeCourseItem);
    }
    if (Array.isArray(obj.data)) {
      return obj.data.map(normalizeCourseItem);
    }
  }

  return [];
}

function parseCourseId(course: TutorCourseListItem): number {
  return typeof course.ID === "string" ? parseInt(course.ID, 10) : course.ID;
}

function parseAuthorId(course: TutorCourseListItem): number {
  const author = course.post_author;
  return typeof author === "string" ? parseInt(author, 10) : author;
}

export async function fetchTutorCoursesPage(
  page: number,
  perPage = 50,
): Promise<TutorCourseListItem[]> {
  const data = await tutorFetch<TutorApiResponse<unknown>>(
    `/courses?order=desc&orderby=ID&paged=${page}&per_page=${perPage}`,
    { fresh: true },
  );
  return extractCourseList(data.data);
}

export async function fetchAllTutorCourses(): Promise<TutorCourseListItem[]> {
  const all: TutorCourseListItem[] = [];
  let page = 1;

  while (true) {
    const batch = await fetchTutorCoursesPage(page);
    if (batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 50) break;
    page += 1;
  }

  return all;
}

export async function fetchTutorCourseDetail(
  courseId: number,
): Promise<TutorCourseDetail | null> {
  try {
    const data = await tutorFetch<TutorApiResponse<TutorCourseDetail>>(
      `/courses/${courseId}`,
      { fresh: true },
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchTutorCourseRating(
  courseId: number,
): Promise<TutorCourseRating | null> {
  try {
    const data = await tutorFetch<TutorApiResponse<TutorCourseRating>>(
      `/course-rating/${courseId}`,
      { fresh: true },
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchTutorCourseReviews(
  courseId: number,
): Promise<TutorReviewItem[]> {
  const endpoints = [
    `/reviews?course_id=${courseId}`,
    `/reviews/${courseId}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const data = await tutorFetch<
        TutorApiResponse<TutorReviewItem[] | TutorReviewItem>
      >(endpoint, { fresh: true });

      if (Array.isArray(data.data)) return data.data;
      if (data.data && typeof data.data === "object") {
        const nested = data.data as TutorCourseRating;
        if (Array.isArray(nested.reviews)) return nested.reviews;
        return [data.data as TutorReviewItem];
      }
    } catch {
      // try next endpoint
    }
  }

  return fetchWpCommentsAsReviews(courseId);
}

async function fetchWpCommentsAsReviews(
  courseId: number,
): Promise<TutorReviewItem[]> {
  try {
    const res = await fetch(
      `${WP_API_BASE}/comments?post=${courseId}&per_page=100&orderby=date&order=desc`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];

    const comments = (await res.json()) as WpComment[];
    return comments.map((comment) => ({
      comment_ID: comment.id,
      user_name: comment.author_name,
      review: comment.content?.rendered ?? "",
      post_date: comment.date,
      rating: parseNumber(comment.meta?.tutor_rating),
    }));
  } catch {
    return [];
  }
}

export async function fetchTutorAuthorInfo(
  authorId: number,
): Promise<TutorAuthorInfo | null> {
  try {
    const data = await tutorFetch<TutorApiResponse<TutorAuthorInfo>>(
      `/author-information/${authorId}`,
      { fresh: true },
    );
    return data.data ?? null;
  } catch {
    return null;
  }
}

export async function fetchTutorEnrollmentCount(
  courseId: number,
): Promise<number> {
  try {
    const data = await tutorFetch<
      TutorApiResponse<{ total?: number; count?: number; data?: unknown[] }>
    >(`/enrollments?course_id=${courseId}`, { fresh: true });

    if (typeof data.data === "object" && data.data !== null) {
      const payload = data.data as { total?: number; count?: number };
      if (typeof payload.total === "number") return payload.total;
      if (typeof payload.count === "number") return payload.count;
      if (Array.isArray(data.data)) return data.data.length;
    }
  } catch {
    // fall through
  }
  return 0;
}

export function resolveCourseImage(course: TutorCourseListItem): string | null {
  return course.thumbnail_url || course.thumbnail || course.image || null;
}

export function resolveRatingStats(
  rating: TutorCourseRating | null,
  detail: TutorCourseDetail | null,
): { ratingAvg: number; ratingCount: number } {
  const detailRating = detail?.course_rating;
  const avg =
    parseNumber(rating?.rating_avg) ||
    parseNumber(rating?.rating) ||
    parseNumber(detailRating?.rating_avg);
  const count =
    parseNumber(rating?.rating_count) ||
    parseNumber(rating?.count) ||
    parseNumber(detailRating?.rating_count) ||
    parseNumber(detailRating?.count);

  return { ratingAvg: avg, ratingCount: count };
}

export function resolveEnrollmentCount(
  course: TutorCourseListItem,
  detail: TutorCourseDetail | null,
  fallback: number,
): number {
  return (
    parseNumber(course.total_enrolled) ||
    parseNumber(course.enrollment_count) ||
    parseNumber(detail?.total_enrolled) ||
    fallback
  );
}

export function mapReviewToRow(
  review: TutorReviewItem,
  courseId: number,
): {
  wp_course_id: number;
  wp_review_id: number;
  student_name: string | null;
  rating: number | null;
  review_text: string | null;
  reviewed_at: string | null;
} | null {
  const reviewId =
    review.review_id ??
    review.comment_ID ??
    review.ID ??
    review.id;

  if (!reviewId) return null;

  const rating = parseNumber(review.rating);
  const text =
    review.review ??
    review.review_content ??
    review.comment_content ??
    review.content ??
    null;

  return {
    wp_course_id: courseId,
    wp_review_id: reviewId,
    student_name:
      review.student_name ??
      review.display_name ??
      review.user_name ??
      null,
    rating: rating > 0 ? Math.min(5, Math.max(1, Math.round(rating))) : null,
    review_text: text,
    reviewed_at:
      review.post_date ??
      review.post_date_gmt ??
      review.created_at ??
      null,
  };
}

export { parseCourseId, parseAuthorId, parseNumber, TUTOR_API_BASE };
