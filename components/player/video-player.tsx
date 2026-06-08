"use client";

import { useRef, useEffect, useMemo } from "react";
import { useVideoProgress } from "@/hooks/use-video-progress";
import { useEmbedVideoProgress } from "@/hooks/use-embed-video-progress";
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
    enabled: videoType === "html5" || videoType === null,
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

  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-primary-900 text-white">
        <p>Video bulunamadı</p>
      </div>
    );
  }

  if (videoType === "youtube" && youtubeEmbedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          ref={iframeRef}
          src={youtubeEmbedUrl}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Ders videosu"
        />
      </div>
    );
  }

  if (videoType === "vimeo" && vimeoEmbedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          ref={iframeRef}
          src={vimeoEmbedUrl}
          className="h-full w-full"
          allowFullScreen
          allow="autoplay; fullscreen; picture-in-picture"
          title="Ders videosu"
        />
      </div>
    );
  }

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        controlsList="nodownload"
        crossOrigin="anonymous"
        className="h-full w-full"
        playsInline
      >
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
    </div>
  );
}
