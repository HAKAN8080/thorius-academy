import { tutorFetch, TUTOR_API_BASE } from "@/lib/tutor/api";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";
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

function parseAuthorFromUnknown(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = parseInt(value, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return parseNumber(obj.ID ?? obj.id ?? obj.user_id ?? obj.post_author);
  }
  return 0;
}

function normalizeCourseItem(raw: unknown): TutorCourseListItem {
  const item = (raw ?? {}) as Record<string, unknown>;
  return {
    ID: parseNumber(item.ID ?? item.id),
    post_author: parseAuthorFromUnknown(
      item.post_author ?? item.author ?? item.instructor_id ?? 0,
    ),
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
    if (Array.isArray(obj.posts)) {
      return obj.posts.map(normalizeCourseItem);
    }
  }

  return [];
}

function getWpRestBaseCandidates(): string[] {
  const candidates = new Set<string>();

  const fromEnv = process.env.NEXT_PUBLIC_WP_API_URL?.replace(/\/$/, "");
  if (fromEnv) {
    candidates.add(fromEnv);
  }

  const wpApiUrl = process.env.WP_API_URL?.replace(/\/$/, "");
  if (wpApiUrl) {
    candidates.add(
      wpApiUrl.includes("/wp-json/")
        ? wpApiUrl
        : `${wpApiUrl}/wp-json/wp/v2`,
    );
  }

  const origin = getWpSiteOrigin();
  if (origin) {
    candidates.add(`${origin}/wp-json/wp/v2`);
  }

  candidates.add("https://thorius.com.tr/wp-json/wp/v2");

  return Array.from(candidates);
}

async function fetchCoursesFromWpRestBase(
  base: string,
): Promise<TutorCourseListItem[]> {
  const all: TutorCourseListItem[] = [];
  let page = 1;

  while (page <= 20) {
    const response = await fetch(
      `${base}/courses?per_page=100&page=${page}&status=any`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      },
    );

    if (!response.ok) {
      console.warn("[WP REST] courses fetch failed:", base, response.status, page);
      break;
    }

    const batch = (await response.json().catch(() => null)) as
      | Record<string, unknown>[]
      | null;

    if (!Array.isArray(batch) || batch.length === 0) {
      break;
    }

    all.push(...batch.map(normalizeWpRestCourse));
    if (batch.length < 100) {
      break;
    }
    page += 1;
  }

  return all;
}

function normalizeWpRestCourse(raw: Record<string, unknown>): TutorCourseListItem {
  const title = raw.title as { rendered?: string } | undefined;
  return {
    ID: parseNumber(raw.id ?? raw.ID),
    post_author: parseNumber(raw.author ?? raw.post_author),
    post_title: title?.rendered ?? String(raw.post_title ?? raw.title ?? ""),
    post_name: String(raw.slug ?? raw.post_name ?? ""),
    post_status: String(raw.status ?? raw.post_status ?? "publish"),
    post_date: String(raw.date ?? raw.post_date ?? ""),
    post_date_gmt:
      typeof raw.date_gmt === "string"
        ? raw.date_gmt
        : typeof raw.post_date_gmt === "string"
          ? raw.post_date_gmt
          : undefined,
  };
}

async function fetchAllCoursesFromWpRest(): Promise<TutorCourseListItem[]> {
  for (const base of getWpRestBaseCandidates()) {
    const courses = await fetchCoursesFromWpRestBase(base);
    if (courses.length > 0) {
      console.log(`[WP REST] loaded ${courses.length} courses from ${base}`);
      return courses;
    }
  }

  return [];
}

export async function enrichCoursesWithAuthorIds(
  courses: TutorCourseListItem[],
  defaultAuthorId: number,
): Promise<TutorCourseListItem[]> {
  const wpCourses = await fetchAllCoursesFromWpRest();
  const authorByCourseId = new Map<number, number>();

  for (const wpCourse of wpCourses) {
    const courseId = parseCourseId(wpCourse);
    const authorId = parseAuthorId(wpCourse);
    if (courseId > 0 && authorId > 0) {
      authorByCourseId.set(courseId, authorId);
    }
  }

  return courses.map((course) => {
    const courseId = parseCourseId(course);
    const currentAuthor = parseAuthorId(course);
    if (currentAuthor > 0) {
      return course;
    }

    const mappedAuthor = courseId > 0 ? authorByCourseId.get(courseId) : undefined;
    return {
      ...course,
      post_author: mappedAuthor && mappedAuthor > 0 ? mappedAuthor : defaultAuthorId,
    };
  });
}

function parseCourseId(course: TutorCourseListItem): number {
  return typeof course.ID === "string" ? parseInt(course.ID, 10) : course.ID;
}

function parseAuthorId(course: TutorCourseListItem): number {
  return parseAuthorFromUnknown(course.post_author);
}

function mergeCourseRecords(
  primary: TutorCourseListItem,
  secondary: TutorCourseListItem,
): TutorCourseListItem {
  const primaryAuthor = parseAuthorId(primary);
  const secondaryAuthor = parseAuthorId(secondary);

  return {
    ...secondary,
    ...primary,
    post_author: primaryAuthor > 0 ? primaryAuthor : secondaryAuthor,
    post_title: primary.post_title || secondary.post_title,
    post_name: primary.post_name || secondary.post_name,
    post_status: primary.post_status || secondary.post_status,
    post_date: primary.post_date || secondary.post_date,
    post_date_gmt: primary.post_date_gmt ?? secondary.post_date_gmt,
    thumbnail_url: primary.thumbnail_url ?? secondary.thumbnail_url,
    thumbnail: primary.thumbnail ?? secondary.thumbnail,
    image: primary.image ?? secondary.image,
  };
}

function mergeCourseCatalog(
  tutorCourses: TutorCourseListItem[],
  wpCourses: TutorCourseListItem[],
): TutorCourseListItem[] {
  const byId = new Map<number, TutorCourseListItem>();

  for (const course of wpCourses) {
    const id = parseCourseId(course);
    if (id > 0) {
      byId.set(id, course);
    }
  }

  for (const course of tutorCourses) {
    const id = parseCourseId(course);
    if (id <= 0) {
      continue;
    }

    const existing = byId.get(id);
    byId.set(id, existing ? mergeCourseRecords(course, existing) : course);
  }

  return Array.from(byId.values());
}

export async function fetchTutorCoursesPage(
  page: number,
  perPage = 50,
): Promise<TutorCourseListItem[]> {
  const data = await tutorFetch<TutorApiResponse<unknown>>(
    `/courses?order=desc&orderby=ID&paged=${page}&per_page=${perPage}`,
    { fresh: true },
  );

  const fromData = extractCourseList(data.data);
  if (fromData.length > 0) {
    return fromData;
  }

  return extractCourseList(data);
}

export async function fetchAllTutorCourses(): Promise<{
  courses: TutorCourseListItem[];
  source: "tutor-api" | "wp-rest" | "merged";
  wpCoursesFetched: number;
  tutorCoursesFetched: number;
}> {
  const tutorCourses: TutorCourseListItem[] = [];
  let page = 1;

  try {
    while (page <= 20) {
      const batch = await fetchTutorCoursesPage(page, 100);
      if (batch.length === 0) break;
      tutorCourses.push(...batch);
      if (batch.length < 100) break;
      page += 1;
    }
  } catch (error) {
    console.warn("[Tutor Courses] Tutor API failed:", error);
  }

  const wpCourses = await fetchAllCoursesFromWpRest();
  const merged = mergeCourseCatalog(tutorCourses, wpCourses);
  const defaultAuthorId = parseInt(
    process.env.DEFAULT_INSTRUCTOR_WP_ID ?? "277",
    10,
  );
  const enriched = await enrichCoursesWithAuthorIds(
    merged.length > 0 ? merged : tutorCourses,
    Number.isNaN(defaultAuthorId) ? 277 : defaultAuthorId,
  );

  if (tutorCourses.length > 0 && wpCourses.length > 0) {
    return {
      courses: enriched,
      source: "merged",
      wpCoursesFetched: wpCourses.length,
      tutorCoursesFetched: tutorCourses.length,
    };
  }

  if (tutorCourses.length > 0) {
    return {
      courses: enriched,
      source: "tutor-api",
      wpCoursesFetched: wpCourses.length,
      tutorCoursesFetched: tutorCourses.length,
    };
  }

  return {
    courses: enriched,
    source: "wp-rest",
    wpCoursesFetched: wpCourses.length,
    tutorCoursesFetched: 0,
  };
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

interface WpCourseCategoryRef {
  id: number;
  name: string;
  slug: string;
}

interface WpCourseMetaRef {
  id: number;
  slug: string;
  title: { rendered?: string };
  status?: string;
  author?: number;
}

async function fetchWpJson<T>(
  url: string,
): Promise<T | null> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function fetchWpCourseCategoryIds(
  wpCourseId: number,
): Promise<number[]> {
  for (const base of getWpRestBaseCandidates()) {
    const course = await fetchWpJson<Record<string, unknown>>(
      `${base}/courses/${wpCourseId}?_fields=course-category`,
    );
    const categoryIds = course?.["course-category"];
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      return categoryIds
        .map((value) => parseNumber(value))
        .filter((value) => value > 0);
    }
  }

  return [];
}

export async function fetchAllWpCourseCategories(): Promise<
  WpCourseCategoryRef[]
> {
  for (const base of getWpRestBaseCandidates()) {
    const categories = await fetchWpJson<WpCourseCategoryRef[]>(
      `${base}/course-category?per_page=100&hide_empty=false&_fields=id,name,slug`,
    );
    if (categories?.length) {
      return categories;
    }
  }

  return [];
}

export async function fetchWpCoursePrimaryCategoryName(
  wpCourseId: number,
  categoryById?: Map<number, WpCourseCategoryRef>,
): Promise<string | null> {
  const categoryIds = await fetchWpCourseCategoryIds(wpCourseId);
  if (categoryIds.length === 0) {
    return null;
  }

  const primaryCategoryId = categoryIds[0];
  const cached = categoryById?.get(primaryCategoryId);
  if (cached?.name) {
    return cached.name;
  }

  for (const base of getWpRestBaseCandidates()) {
    const category = await fetchWpJson<WpCourseCategoryRef>(
      `${base}/course-category/${primaryCategoryId}?_fields=id,name,slug`,
    );
    if (category?.name) {
      return category.name;
    }
  }

  return null;
}

export async function fetchWpCourseMetaById(
  wpCourseId: number,
): Promise<{
  slug: string;
  title: string;
  instructorWpUserId: number;
  published: boolean;
} | null> {
  for (const base of getWpRestBaseCandidates()) {
    const course = await fetchWpJson<WpCourseMetaRef>(
      `${base}/courses/${wpCourseId}?_fields=id,slug,title,status,author`,
    );
    if (!course?.id) {
      continue;
    }

    return {
      slug: course.slug,
      title: course.title?.rendered ?? "",
      instructorWpUserId: parseNumber(course.author),
      published: course.status === "publish",
    };
  }

  return null;
}

export { parseCourseId, parseAuthorId, parseNumber, TUTOR_API_BASE };
