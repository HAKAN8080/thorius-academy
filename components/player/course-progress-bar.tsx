"use client";

import { useEffect, useState } from "react";
import type { CourseProgressResponse } from "@/lib/progress/types";

interface CourseProgressBarProps {
  courseId: number;
  className?: string;
}

export function CourseProgressBar({
  courseId,
  className = "",
}: CourseProgressBarProps) {
  const [progress, setProgress] = useState<CourseProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProgress() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/progress/course/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to load progress");
        }
        const data = (await response.json()) as CourseProgressResponse;
        if (!cancelled) {
          setProgress(data);
        }
      } catch (error) {
        console.error("[CourseProgressBar] Load failed:", error);
        if (!cancelled) {
          setProgress(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProgress();

    function handleRefresh(event: Event) {
      const detail = (event as CustomEvent<{ courseId?: number }>).detail;
      if (!detail?.courseId || detail.courseId === courseId) {
        void loadProgress();
      }
    }

    window.addEventListener("course-progress-refresh", handleRefresh);

    return () => {
      cancelled = true;
      window.removeEventListener("course-progress-refresh", handleRefresh);
    };
  }, [courseId]);

  if (isLoading) {
    return (
      <div
        className={`h-2 w-32 animate-pulse rounded-full bg-[#0B1E3F]/10 ${className}`}
        aria-hidden="true"
      />
    );
  }

  if (!progress) {
    return null;
  }

  return (
    <div className={`min-w-[12rem] ${className}`}>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs font-medium text-[#0B1E3F]">
        <span>
          {progress.completed_count} / {progress.total_lessons} ders tamamlandı
        </span>
        <span>%{progress.completion_percent}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-[#0B1E3F]/10"
        role="progressbar"
        aria-valuenow={progress.completion_percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Kurs ilerlemesi"
      >
        <div
          className="h-full rounded-full bg-[#D4AF37] transition-all duration-500"
          style={{ width: `${progress.completion_percent}%` }}
        />
      </div>
    </div>
  );
}
