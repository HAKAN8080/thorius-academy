"use client";

import { useRef, useEffect, useState } from "react";
import { updateLessonProgress } from "@/lib/actions/lesson-progress";

interface Props {
  videoType: "external_url" | "youtube" | "html5" | "vimeo" | null;
  videoUrl: string | null;
  embedUrl: string | null;
  lessonId: string;
  courseId: number;
  courseSlug: string;
  wpLessonId: number;
  initialWatchedSeconds?: number;
  onComplete?: () => void;
}

export function VideoPlayer({
  videoType,
  videoUrl,
  embedUrl,
  lessonId,
  courseId,
  courseSlug,
  wpLessonId,
  initialWatchedSeconds = 0,
  onComplete,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasMarkedComplete, setHasMarkedComplete] = useState(false);
  const lastSavedRef = useRef(initialWatchedSeconds);

  useEffect(() => {
    if (videoRef.current && initialWatchedSeconds > 0) {
      videoRef.current.currentTime = initialWatchedSeconds;
    }
  }, [initialWatchedSeconds, lessonId]);

  useEffect(() => {
    if (videoType === "youtube" || !videoRef.current) return;

    const video = videoRef.current;
    const interval = setInterval(() => {
      const current = Math.floor(video.currentTime);
      if (current - lastSavedRef.current >= 15) {
        updateLessonProgress({
          lessonId,
          courseId,
          courseSlug,
          wpLessonId,
          watchedSeconds: current,
        });
        lastSavedRef.current = current;
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [lessonId, courseId, courseSlug, wpLessonId, videoType]);

  function handleEnded() {
    if (!hasMarkedComplete) {
      setHasMarkedComplete(true);
      updateLessonProgress({
        lessonId,
        courseId,
        courseSlug,
        wpLessonId,
        watchedSeconds: videoRef.current?.duration || 0,
        completed: true,
      });
      onComplete?.();
    }
  }

  if (!videoUrl) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-2xl bg-primary-900 text-white">
        <p>Video bulunamadı</p>
      </div>
    );
  }

  if (videoType === "youtube" && embedUrl) {
    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embedUrl}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
        onEnded={handleEnded}
        className="h-full w-full"
        playsInline
      >
        Tarayıcınız video oynatmayı desteklemiyor.
      </video>
    </div>
  );
}
