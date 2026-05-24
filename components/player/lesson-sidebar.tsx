"use client";

import Link from "next/link";
import { CheckCircle2, Circle, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Lesson, LessonProgress } from "@/types/lesson";

interface Topic {
  topic_title: string;
  topic_order: number;
  lessons: Lesson[];
}

interface Props {
  courseSlug: string;
  topics: Topic[];
  currentLessonId?: string;
  progressMap: Record<string, LessonProgress>;
}

export function LessonSidebar({
  courseSlug,
  topics,
  currentLessonId,
  progressMap,
}: Props) {
  return (
    <aside className="overflow-hidden rounded-2xl border border-primary-100 bg-white">
      <div className="bg-primary-950 p-4 text-white">
        <h2 className="font-semibold">Kurs İçeriği</h2>
        <p className="mt-1 text-sm text-primary-200">
          {topics.reduce((sum, t) => sum + t.lessons.length, 0)} ders
        </p>
      </div>
      <div className="max-h-[600px] divide-y divide-primary-50 overflow-y-auto">
        {topics.map((topic) => (
          <div key={topic.topic_order} className="py-2">
            <div className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-primary-700">
              {topic.topic_title}
            </div>
            <ul>
              {topic.lessons.map((lesson) => {
                const progress = progressMap[lesson.id];
                const isCompleted = progress?.completed;
                const isActive = lesson.id === currentLessonId;
                return (
                  <li key={lesson.id}>
                    <Link
                      href={`/panel/kurslarim/${courseSlug}?lesson=${lesson.id}`}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-primary-50",
                        isActive && "border-l-4 border-accent-500 bg-accent-50"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : isActive ? (
                          <PlayCircle className="h-5 w-5 text-accent-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-primary-300" />
                        )}
                      </div>
                      <div className="min-w-0 flex-grow">
                        <p
                          className={cn(
                            "truncate text-sm font-medium",
                            isActive ? "text-primary-950" : "text-primary-800"
                          )}
                        >
                          {lesson.title}
                        </p>
                        {lesson.duration_seconds ? (
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatDuration(lesson.duration_seconds)}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
