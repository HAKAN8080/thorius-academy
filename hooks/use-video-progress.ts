"use client";

import { useEffect, type RefObject } from "react";
import { PROGRESS_COMPLETION_THRESHOLD, PROGRESS_SAVE_INTERVAL_MS } from "@/lib/progress/client";
import { useProgressSaver } from "@/hooks/use-progress-saver";

interface UseVideoProgressOptions {
  lessonId: string;
  courseId: number;
  videoRef: RefObject<HTMLVideoElement | null>;
  initialWatchedSeconds?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

export function useVideoProgress({
  lessonId,
  courseId,
  videoRef,
  initialWatchedSeconds = 0,
  enabled = true,
  onComplete,
}: UseVideoProgressOptions) {
  const { saveProgress, queueSave, lastSavedRef, hasMarkedCompleteRef } =
    useProgressSaver({
      lessonId,
      courseId,
      initialWatchedSeconds,
      onComplete,
    });

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.paused) {
        return;
      }

      const current = Math.floor(video.currentTime);
      if (current > lastSavedRef.current) {
        queueSave(current, false);
      }
    }, PROGRESS_SAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [enabled, lessonId, lastSavedRef, queueSave, videoRef]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const video = videoRef.current;
    if (!video) {
      return;
    }

    function handleTimeUpdate() {
      if (hasMarkedCompleteRef.current) {
        return;
      }

      const el = videoRef.current;
      if (!el) {
        return;
      }

      const duration = el.duration;
      if (!Number.isFinite(duration) || duration <= 0) {
        return;
      }

      const current = Math.floor(el.currentTime);
      if (current / duration >= PROGRESS_COMPLETION_THRESHOLD) {
        hasMarkedCompleteRef.current = true;
        void saveProgress(current, true);
      }
    }

    function handleEnded() {
      if (hasMarkedCompleteRef.current) {
        return;
      }

      const el = videoRef.current;
      if (!el) {
        return;
      }

      const duration = Math.floor(el.duration || el.currentTime);
      hasMarkedCompleteRef.current = true;
      void saveProgress(duration, true);
    }

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [enabled, hasMarkedCompleteRef, lessonId, saveProgress, videoRef]);

  return { saveProgress, queueSave };
}
