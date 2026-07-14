import { unstable_cache } from "next/cache";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import {
  COURSE_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;
/** Soft deadline for WordPress cover/media fetches during catalog SSR. */
const WP_FETCH_TIMEOUT_MS = 3500;
const WP_COVER_BATCH_SIZE = 100;

// `_embedded` ve `_links` olmadan WP, `_fields` ile birlikte `_embed` edilen
// featured media bloğunu kırpar; bu olmadan WP featured görseli olan kurslar çözülemez.
const WP_COVER_FIELDS =
  "id,slug,featured_media,thorius_youtube,_links,_embedded";

export function normalizeCoverImageUrl(
  url: string | null | undefined,
): string | null {
  const trimmed = url?.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (trimmed.startsWith("/")) {
    return `https://thorius.com.tr${trimmed}`;
  }

  if (trimmed.startsWith("http://")) {
    return trimmed.replace(/^http:\/\//i, "https://");
  }

  return trimmed;
}

/** WP'ye yüklenmiş YouTube aynası; i.ytimg tercih edilir ama ayna da geçerlidir. */
export function isWpYoutubeMirrorUrl(url: string | null | undefined): boolean {
  const normalized = normalizeCoverImageUrl(url);
  if (!normalized) {
    return false;
  }

  return /wp-content\/uploads\/.*(?:maxresdefault|hqdefault|sddefault)/i.test(
    normalized,
  );
}

function resolveCoverFromWpFields(course: {
  featured_media?: number;
  thorius_youtube?: {
    video_id?: string;
    thumbnail_url?: string;
  } | null;
  media_source_url?: string | null;
}): string | null {
  const youtubeThumb = course.thorius_youtube?.thumbnail_url?.trim();
  if (youtubeThumb) {
    return normalizeCoverImageUrl(youtubeThumb);
  }

  const videoId = course.thorius_youtube?.video_id?.trim();
  if (videoId) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

  if ((course.featured_media ?? 0) > 0 && course.media_source_url) {
    return normalizeCoverImageUrl(course.media_source_url);
  }

  return null;
}

type WpCoverCourseResponse = {
  id?: number;
  featured_media?: number;
  thorius_youtube?: {
    video_id?: string;
    thumbnail_url?: string;
  } | null;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      media_details?: {
        sizes?: {
          large?: { source_url?: string };
          medium?: { source_url?: string };
        };
      };
    }>;
  };
};

function parseWpCoverCourse(course: WpCoverCourseResponse): string | null {
  const featuredMedia = course._embedded?.["wp:featuredmedia"]?.[0];
  const mediaSourceUrl =
    featuredMedia?.media_details?.sizes?.large?.source_url ||
    featuredMedia?.media_details?.sizes?.medium?.source_url ||
    featuredMedia?.source_url ||
    null;

  return resolveCoverFromWpFields({
    featured_media: course.featured_media,
    thorius_youtube: course.thorius_youtube,
    media_source_url: mediaSourceUrl,
  });
}

async function fetchWpCoverFromApi(slug: string): Promise<string | null> {
  for (const variant of getCourseSlugLookupVariants(slug)) {
    const res = await fetch(
      `${WP_API_BASE}/courses?slug=${encodeURIComponent(variant)}&_embed=wp:featuredmedia&_fields=${WP_COVER_FIELDS}`,
      {
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT_MS),
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CACHE_TAG, courseSlugCacheTag(variant)],
        },
      },
    );

    if (!res.ok) {
      continue;
    }

    const courses: WpCoverCourseResponse[] = await res.json();
    const cover = courses[0] ? parseWpCoverCourse(courses[0]) : null;
    if (cover) {
      return cover;
    }
  }

  return null;
}

async function fetchWpCoverImageBySlugUncached(
  slug: string,
): Promise<string | null> {
  try {
    return await fetchWpCoverFromApi(slug);
  } catch (error) {
    console.error("[resolve-course-cover-image] fetch failed:", slug, error);
    return null;
  }
}

export async function fetchWpCoverImageBySlug(
  slug: string,
): Promise<string | null> {
  return unstable_cache(
    () => fetchWpCoverImageBySlugUncached(slug),
    ["wp-course-cover-by-slug", slug],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [COURSE_CACHE_TAG, courseSlugCacheTag(slug)],
    },
  )();
}

/** CLI / backfill — Next cache olmadan doğrudan WP fetch. */
export function fetchWpCoverImageBySlugFresh(
  slug: string,
): Promise<string | null> {
  return fetchWpCoverImageBySlugUncached(slug);
}

function mergeWpCoverBatch(
  record: Record<number, string>,
  courses: WpCoverCourseResponse[],
): void {
  for (const course of courses) {
    if (!course.id) {
      continue;
    }
    const cover = parseWpCoverCourse(course);
    if (cover) {
      record[course.id] = cover;
    }
  }
}

async function fetchWpCoverImagesByWpIdsUncached(
  wpCourseIds: number[],
): Promise<Record<number, string>> {
  const uniqueIds = Array.from(new Set(wpCourseIds.filter((id) => id > 0)));
  if (uniqueIds.length === 0) {
    return {};
  }

  const record: Record<number, string> = {};

  for (let offset = 0; offset < uniqueIds.length; offset += WP_COVER_BATCH_SIZE) {
    const chunk = uniqueIds.slice(offset, offset + WP_COVER_BATCH_SIZE);
    const res = await fetch(
      `${WP_API_BASE}/courses?include=${chunk.join(",")}&per_page=${chunk.length}&_embed=wp:featuredmedia&_fields=${WP_COVER_FIELDS}`,
      {
        signal: AbortSignal.timeout(WP_FETCH_TIMEOUT_MS),
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CACHE_TAG],
        },
      },
    );

    if (!res.ok) {
      throw new Error(
        `[resolve-course-cover-image] batch fetch failed: ${res.status} ${res.statusText}`,
      );
    }

    const courses: WpCoverCourseResponse[] = await res.json();
    mergeWpCoverBatch(record, courses);
  }

  return record;
}

export async function fetchWpCoverImagesByWpIds(
  wpCourseIds: number[],
): Promise<Record<number, string>> {
  const uniqueIds = Array.from(new Set(wpCourseIds.filter((id) => id > 0))).sort(
    (a, b) => a - b,
  );
  const key = uniqueIds.join(",");

  if (!key) {
    return {};
  }

  return unstable_cache(
    () => fetchWpCoverImagesByWpIdsUncached(uniqueIds),
    ["wp-course-cover-by-ids", key],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [COURSE_CACHE_TAG],
    },
  )();
}

/** CLI / backfill — Next cache olmadan doğrudan WP batch fetch. */
export function fetchWpCoverImagesByWpIdsFresh(
  wpCourseIds: number[],
): Promise<Record<number, string>> {
  return fetchWpCoverImagesByWpIdsUncached(wpCourseIds);
}

export function pickBestCoverImageUrl(options: {
  coverImageUrl?: string | null;
  fallbackUrl?: string | null;
}): string | null {
  const dbCover = normalizeCoverImageUrl(options.coverImageUrl);
  const fallback = normalizeCoverImageUrl(options.fallbackUrl);

  if (fallback && (!dbCover || isWpYoutubeMirrorUrl(dbCover))) {
    return fallback;
  }

  return dbCover ?? fallback ?? null;
}

export async function resolveCourseCoverImageUrl(options: {
  slug: string;
  coverImageUrl?: string | null;
  wpCourseId?: number | null;
}): Promise<string | null> {
  const dbCover = normalizeCoverImageUrl(options.coverImageUrl);
  if (dbCover && !isWpYoutubeMirrorUrl(dbCover)) {
    return dbCover;
  }

  if (options.wpCourseId && options.wpCourseId > 0) {
    const byId = await fetchWpCoverImagesByWpIds([options.wpCourseId]);
    const fromBatch = byId[options.wpCourseId] ?? null;
    const picked = pickBestCoverImageUrl({
      coverImageUrl: options.coverImageUrl,
      fallbackUrl: fromBatch,
    });
    if (picked) {
      return picked;
    }
  }

  const wpCover = await fetchWpCoverImageBySlug(options.slug);
  return pickBestCoverImageUrl({
    coverImageUrl: options.coverImageUrl,
    fallbackUrl: wpCover,
  });
}
