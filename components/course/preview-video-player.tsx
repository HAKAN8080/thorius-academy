"use client";

import {
  buildVimeoEmbedUrl,
  buildYouTubeEmbedUrl,
} from "@/lib/video/embed";

interface PreviewVideoPlayerProps {
  videoType: "external_url" | "youtube" | "html5" | "vimeo" | null;
  videoUrl: string | null;
  embedUrl: string | null;
}

export function PreviewVideoPlayer({
  videoType,
  videoUrl,
  embedUrl,
}: PreviewVideoPlayerProps) {
  if (videoType === "youtube") {
    const source = embedUrl || videoUrl;
    const youtubeEmbedUrl = source ? buildYouTubeEmbedUrl(source) : null;
    if (!youtubeEmbedUrl) {
      return <MissingVideoMessage />;
    }

    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-primary-100 bg-black shadow-lg">
        <iframe
          src={youtubeEmbedUrl}
          title="Ders önizlemesi"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (videoType === "vimeo" && videoUrl) {
    const vimeoEmbedUrl = buildVimeoEmbedUrl(videoUrl);
    if (!vimeoEmbedUrl) {
      return <MissingVideoMessage />;
    }

    return (
      <div className="aspect-video overflow-hidden rounded-2xl border border-primary-100 bg-black shadow-lg">
        <iframe
          src={vimeoEmbedUrl}
          title="Ders önizlemesi"
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const source = embedUrl || videoUrl;
  if (!source) {
    return <MissingVideoMessage />;
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl border border-primary-100 bg-black shadow-lg">
      {videoType === "html5" || !videoType ? (
        <video
          src={source}
          controls
          playsInline
          className="h-full w-full bg-black"
        />
      ) : (
        <iframe
          src={source}
          title="Ders önizlemesi"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
    </div>
  );
}

function MissingVideoMessage() {
  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 px-6 py-10 text-center text-sm text-muted-foreground">
      Bu ders için oynatılabilir video bulunamadı.
    </div>
  );
}
