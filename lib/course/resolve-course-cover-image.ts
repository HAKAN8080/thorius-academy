import { unstable_cache } from "next/cache";
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

/** WP'ye yüklenmiş YouTube aynası; doğrudan i.ytimg genelde daha güvenilir. */
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

async function fetchWpCoverImageBySlugUncached(
  slug: string,
): Promise<string | null> {
  try {
    const res = await fetch(
      `${WP_API_BASE}/courses?slug=${encodeURIComponent(slug)}&_embed=wp:featuredmedia&_fields=${WP_COVER_FIELDS}`,
      {
        next: {
          revalidate: REVALIDATE_SECONDS,
          tags: [COURSE_CACHE_TAG, courseSlugCacheTag(slug)],
        },
      },
    );

    if (!res.ok) {
      return null;
    }

    const courses: Array<{
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
    }> = await res.json();

    const course = courses[0];
    if (!course) {
      return null;
    }

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
  const picked = pickBestCoverImageUrl({ coverImageUrl: options.coverImageUrl });
  if (picked && !isWpYoutubeMirrorUrl(picked)) {
    return picked;
  }

  const wpCover = await fetchWpCoverImageBySlug(options.slug);
  return pickBestCoverImageUrl({
    coverImageUrl: options.coverImageUrl,
    fallbackUrl: wpCover,
  });
}
