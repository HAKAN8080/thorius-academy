import { unstable_cache } from "next/cache";
import { fetchWpCoverImageBySlug } from "@/lib/course/resolve-course-cover-image";
import {
  CATEGORY_IMAGE_COURSE_SLUG,
} from "@/lib/wordpress/api";
import {
  COURSE_CACHE_TAG,
  COURSE_CATEGORY_CACHE_TAG,
  courseSlugCacheTag,
} from "@/lib/wordpress/cache-tags";
import type { WPCategory } from "@/types/wordpress";

const WP_API_BASE =
  process.env.NEXT_PUBLIC_WP_API_URL ||
  "https://thorius.com.tr/wp-json/wp/v2";

const REVALIDATE_SECONDS = 3600;

async function fetchCategoryCoverSampleUncached(
  categorySlug: string,
): Promise<string | null> {
  const overrideSlug = CATEGORY_IMAGE_COURSE_SLUG[categorySlug];
  if (overrideSlug) {
    const overrideCover = await fetchWpCoverImageBySlug(overrideSlug);
    if (overrideCover) {
      return overrideCover;
    }
  }

  const catRes = await fetch(
    `${WP_API_BASE}/course-category?slug=${encodeURIComponent(categorySlug)}`,
    {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [COURSE_CATEGORY_CACHE_TAG],
      },
    },
  );
  if (!catRes.ok) {
    return null;
  }

  const categories: WPCategory[] = await catRes.json();
  if (!categories.length) {
    return null;
  }

  const courseRes = await fetch(
    `${WP_API_BASE}/courses?per_page=8&course-category=${categories[0].id}&_embed=wp:featuredmedia&_fields=id,slug,featured_media,thorius_youtube`,
    {
      next: {
        revalidate: REVALIDATE_SECONDS,
        tags: [COURSE_CACHE_TAG, COURSE_CATEGORY_CACHE_TAG],
      },
    },
  );
  if (!courseRes.ok) {
    return null;
  }

  type WpSample = {
    slug: string;
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

  const samples: WpSample[] = await courseRes.json();

  for (const sample of samples) {
    const featuredMedia = sample._embedded?.["wp:featuredmedia"]?.[0];
    const embeddedUrl =
      featuredMedia?.media_details?.sizes?.large?.source_url ||
      featuredMedia?.media_details?.sizes?.medium?.source_url ||
      featuredMedia?.source_url ||
      null;

    if (embeddedUrl) {
      return embeddedUrl;
    }

    const youtubeThumb = sample.thorius_youtube?.thumbnail_url?.trim();
    if (youtubeThumb) {
      return youtubeThumb;
    }

    const videoId = sample.thorius_youtube?.video_id?.trim();
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }

    const slugCover = await fetchWpCoverImageBySlug(sample.slug);
    if (slugCover) {
      return slugCover;
    }
  }

  return null;
}

export async function resolveCategoryCoverImage(
  categorySlug: string,
): Promise<string | null> {
  const slug = categorySlug.trim().toLowerCase();
  if (!slug) {
    return null;
  }

  return unstable_cache(
    () => fetchCategoryCoverSampleUncached(slug),
    ["category-cover-v1", slug],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: [
        COURSE_CATEGORY_CACHE_TAG,
        COURSE_CACHE_TAG,
        courseSlugCacheTag(slug),
      ],
    },
  )();
}

export async function resolveAllCategoryCoverImages(
  categories: WPCategory[],
): Promise<WPCategory[]> {
  return Promise.all(
    categories.map(async (category) => {
      if (category.image?.trim()) {
        return category;
      }

      const cover = await resolveCategoryCoverImage(category.slug);
      return cover ? { ...category, image: cover } : category;
    }),
  );
}
