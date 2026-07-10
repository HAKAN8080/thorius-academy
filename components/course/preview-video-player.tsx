"use client";

import { useTranslations } from "next-intl";
import {
  ProtectedHtml5Video,
  ProtectedVideoIframe,
} from "@/components/player/protected-video-shell";
import { buildBunnyEmbedUrl } from "@/lib/video/bunny-embed";
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
  const t = useTranslations("courses.preview");
  const bunnyEmbedUrl =
    buildBunnyEmbedUrl(embedUrl) ?? buildBunnyEmbedUrl(videoUrl);

  if (bunnyEmbedUrl) {
    return (
      <ProtectedVideoIframe
        src={bunnyEmbedUrl}
        title={t("videoTitle")}
      />
    );
  }

  if (videoType === "youtube") {
    const source = embedUrl || videoUrl;
    const youtubeEmbedUrl = source ? buildYouTubeEmbedUrl(source) : null;
    if (!youtubeEmbedUrl) {
      return <MissingVideoMessage message={t("noVideo")} />;
    }

    return (
      <ProtectedVideoIframe src={youtubeEmbedUrl} title={t("videoTitle")} />
    );
  }

  if (videoType === "vimeo" && videoUrl) {
    const vimeoEmbedUrl = buildVimeoEmbedUrl(videoUrl);
    if (!vimeoEmbedUrl) {
      return <MissingVideoMessage message={t("noVideo")} />;
    }

    return (
      <ProtectedVideoIframe
        src={vimeoEmbedUrl}
        title={t("videoTitle")}
        allow="autoplay; fullscreen; picture-in-picture"
      />
    );
  }

  const source = embedUrl || videoUrl;
  if (!source) {
    return <MissingVideoMessage message={t("noVideo")} />;
  }

  if (videoType === "html5" || videoType === "external_url" || !videoType) {
    return <ProtectedHtml5Video src={source} />;
  }

  return (
    <ProtectedVideoIframe src={source} title={t("videoTitle")} />
  );
}

function MissingVideoMessage({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50 px-6 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}
