import { extractVimeoVideoId, extractYouTubeVideoId } from "@/lib/video/embed";
import type { Lesson } from "@/types/lesson";

function parseIso8601Duration(value: string): number | null {
  const match = value.match(
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/,
  );
  if (!match) {
    return null;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const seconds = Number(match[3] ?? 0);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}

async function fetchYouTubeDurationSeconds(
  videoId: string,
): Promise<number | null> {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "contentDetails");
  url.searchParams.set("id", videoId);
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      items?: Array<{ contentDetails?: { duration?: string } }>;
    };
    const duration = body.items?.[0]?.contentDetails?.duration;
    return duration ? parseIso8601Duration(duration) : null;
  } catch {
    return null;
  }
}

async function fetchVimeoDurationSeconds(videoUrl: string): Promise<number | null> {
  const oembedUrl = new URL("https://vimeo.com/api/oembed.json");
  oembedUrl.searchParams.set("url", videoUrl);

  try {
    const response = await fetch(oembedUrl.toString(), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as { duration?: number };
    return typeof body.duration === "number" && body.duration > 0
      ? Math.round(body.duration)
      : null;
  } catch {
    return null;
  }
}

export async function resolveVideoDurationSeconds(input: {
  video_type: Lesson["video_type"];
  video_url: string;
}): Promise<number | null> {
  const videoUrl = input.video_url.trim();
  if (!videoUrl || input.video_type === null) {
    return null;
  }

  if (input.video_type === "youtube") {
    const videoId = extractYouTubeVideoId(videoUrl);
    return videoId ? fetchYouTubeDurationSeconds(videoId) : null;
  }

  if (input.video_type === "vimeo") {
    const videoId = extractVimeoVideoId(videoUrl);
    if (!videoId) {
      return null;
    }
    return fetchVimeoDurationSeconds(videoUrl);
  }

  return null;
}
