"use client";

import { useRef, useEffect, useMemo } from "react";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { useEmbedVideoProgress } from "@/hooks/use-embed-video-progress";
import {
  ProtectedHtml5Video,
  ProtectedVideoIframe,
} from "@/components/player/protected-video-shell";
import { buildBunnyEmbedUrl } from "@/lib/video/bunny-embed";
import {
  buildVimeoEmbedUrl,
  buildYouTubeEmbedUrl,
} from "@/lib/video/embed";

interface Props {
  videoType: "external_url" | "youtube" | "html5" | "vimeo" | null;
  videoUrl: string | null;
  embedUrl: string | null;
  lessonId: string;
  courseId: number;
  initialWatchedSeconds?: number;
  onComplete?: () => void;
}

export function VideoPlayer({
  videoType,
  videoUrl,
  embedUrl,
  lessonId,
  courseId,
  initialWatchedSeconds = 0,
  onComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const bunnyEmbedUrl = useMemo(
    () => buildBunnyEmbedUrl(embedUrl) ?? buildBunnyEmbedUrl(videoUrl),
    [embedUrl, videoUrl],
  );

  const youtubeEmbedUrl = useMemo(() => {
    if (videoType !== "youtube") {
      return null;
    }
    const source = embedUrl || videoUrl;
    return source ? buildYouTubeEmbedUrl(source) : null;
  }, [embedUrl, videoType, videoUrl]);

  const vimeoEmbedUrl = useMemo(() => {
    if (videoType !== "vimeo" || !videoUrl) {
      return null;
    }
    return buildVimeoEmbedUrl(videoUrl);
  }, [videoType, videoUrl]);

  useEffect(() => {
    if (videoRef.current && initialWatchedSeconds > 0) {
      videoRef.current.currentTime = initialWatchedSeconds;
    }
  }, [initialWatchedSeconds, lessonId]);

  useVideoProgress({
    lessonId,
    courseId,
    videoRef,
    initialWatchedSeconds,
    enabled:
      !bunnyEmbedUrl &&
      (videoType === "html5" || videoType === null || videoType === "external_url"),
    onComplete,
  });

  useEmbedVideoProgress({
    provider: "youtube",
    lessonId,
    courseId,
    iframeRef,
    enabled: videoType === "youtube" && Boolean(youtubeEmbedUrl),
    onComplete,
  });

  useEmbedVideoProgress({
    provider: "vimeo",
    lessonId,
    courseId,
    iframeRef,
    enabled: videoType === "vimeo" && Boolean(vimeoEmbedUrl),
    onComplete,
  });

  if (!videoUrl && !embedUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-primary-900 text-white">
        <p>Video bulunamadı</p>
      </div>
    );
  }

  if (bunnyEmbedUrl) {
    return (
      <ProtectedVideoIframe
        src={bunnyEmbedUrl}
        title="Ders videosu"
        iframeRef={iframeRef}
      />
    );
  }

  if (videoType === "youtube" && youtubeEmbedUrl) {
    return (
      <ProtectedVideoIframe
        src={youtubeEmbedUrl}
        title="Ders videosu"
        iframeRef={iframeRef}
      />
    );
  }

  if (videoType === "vimeo" && vimeoEmbedUrl) {
    return (
      <ProtectedVideoIframe
        src={vimeoEmbedUrl}
        title="Ders videosu"
        allow="autoplay; fullscreen; picture-in-picture"
        iframeRef={iframeRef}
      />
    );
  }

  const html5Source = videoUrl ?? embedUrl;
  if (!html5Source) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-primary-900 text-white">
        <p>Video bulunamadı</p>
      </div>
    );
  }

  return <ProtectedHtml5Video src={html5Source} videoRef={videoRef} />;
}
