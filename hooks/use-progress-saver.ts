"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  PROGRESS_DEBOUNCE_MS,
  dispatchCourseProgressRefresh,
  postLessonProgress,
} from "@/lib/progress/client";

interface UseProgressSaverOptions {
  lessonId: string;
  courseId: number;
  initialWatchedSeconds?: number;
  onComplete?: () => void;
}

export function useProgressSaver({
  lessonId,
  courseId,
  initialWatchedSeconds = 0,
  onComplete,
}: UseProgressSaverOptions) {
  const lastSavedRef = useRef(initialWatchedSeconds);
  const hasMarkedCompleteRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);

  const saveProgress = useCallback(
    async (watchedSeconds: number, completed = false) => {
      if (inFlightRef.current) {
        return;
      }

      inFlightRef.current = true;
      try {
        await postLessonProgress({
          lesson_id: lessonId,
          course_id: courseId,
          watched_seconds: watchedSeconds,
          completed,
        });
        lastSavedRef.current = watchedSeconds;
        if (completed) {
          hasMarkedCompleteRef.current = true;
          dispatchCourseProgressRefresh(courseId);
          onComplete?.();
        }
      } catch (error) {
        console.error("[useProgressSaver] Save failed:", error);
      } finally {
        inFlightRef.current = false;
      }
    },
    [courseId, lessonId, onComplete],
  );

  const queueSave = useCallback(
    (watchedSeconds: number, completed = false) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        void saveProgress(watchedSeconds, completed);
      }, PROGRESS_DEBOUNCE_MS);
    },
    [saveProgress],
  );

  useEffect(() => {
    lastSavedRef.current = initialWatchedSeconds;
    hasMarkedCompleteRef.current = false;
  }, [initialWatchedSeconds, lessonId]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [lessonId]);

  return {
    saveProgress,
    queueSave,
    lastSavedRef,
    hasMarkedCompleteRef,
  };
}
