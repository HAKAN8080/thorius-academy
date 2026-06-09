import type { Lesson } from "@/types/lesson";

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  );
  return match?.[1] ?? null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
}

export function parseVideoUrl(url: string): {
  video_type: Lesson["video_type"];
  video_url: string;
  video_embed_url: string | null;
} {
  const trimmed = url.trim();
  if (!trimmed) {
    return { video_type: null, video_url: "", video_embed_url: null };
  }

  const youtubeId = extractYouTubeId(trimmed);
  if (youtubeId) {
    return {
      video_type: "youtube",
      video_url: trimmed,
      video_embed_url: `https://www.youtube.com/embed/${youtubeId}`,
    };
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return {
      video_type: "vimeo",
      video_url: trimmed,
      video_embed_url: `https://player.vimeo.com/video/${vimeoId}`,
    };
  }

  if (/\.(mp4|webm|ogg)(\?|$)/i.test(trimmed)) {
    return {
      video_type: "html5",
      video_url: trimmed,
      video_embed_url: trimmed,
    };
  }

  return {
    video_type: "external_url",
    video_url: trimmed,
    video_embed_url: trimmed,
  };
}
