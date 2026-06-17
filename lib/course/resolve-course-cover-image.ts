import { unstable_cache } from "next/cache";
import { getCourseSlugLookupVariants } from "@/lib/course/course-slug-lookup";
import { fetchCoursesForListing } from "@/lib/wordpress/api";
import {
  COURSE_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

const WP_COVER_FIELDS = "slug,featured_media,thorius_youtube";

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

/** unstable_cache JSON-safe: Record, Map değil. */
async function buildBulkWpCoverImageRecord(): Promise<Record<string, string>> {
  const courses = await fetchCoursesForListing();
  const record: Record<string, string> = {};

  for (const course of courses) {
    const image = normalizeCoverImageUrl(course.featuredImage);
    if (image) {
      record[course.slug] = image;
    }
  }

  return record;
}

const getCachedBulkWpCoverImageRecord = unstable_cache(
  buildBulkWpCoverImageRecord,
  ["wp-course-featured-images-by-slug"],
  {
    revalidate: REVALIDATE_SECONDS,
    tags: [COURSE_CACHE_TAG],
  },
);

export async function getBulkWpCoverImageRecord(): Promise<Record<string, string>> {
  return getCachedBulkWpCoverImageRecord();
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
}): Promise<string | null> {
  const bulk = await getBulkWpCoverImageRecord();
  const fromBulk = bulk[options.slug] ?? null;
  const picked = pickBestCoverImageUrl({
    coverImageUrl: options.coverImageUrl,
    fallbackUrl: fromBulk,
  });

  if (picked) {
    return picked;
  }

  const wpCover = await fetchWpCoverImageBySlug(options.slug);
  return pickBestCoverImageUrl({
    coverImageUrl: options.coverImageUrl,
    fallbackUrl: wpCover,
  });
}
