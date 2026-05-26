import type { Lesson } from "@/types/lesson";

export interface LessonTopicGroup {
  topic_title: string;
  topic_order: number;
  lessons: Lesson[];
}

export function groupLessonsByTopic(lessons: Lesson[]): LessonTopicGroup[] {
  const topicsMap = new Map<string, LessonTopicGroup>();

  lessons.forEach((lesson) => {
    const key = lesson.topic_title || "Genel";
    if (!topicsMap.has(key)) {
      topicsMap.set(key, {
        topic_title: lesson.topic_title || "Genel",
        topic_order: lesson.topic_order || 999,
        lessons: [],
      });
    }
    topicsMap.get(key)!.lessons.push(lesson);
  });

  return Array.from(topicsMap.values()).sort(
    (a, b) => a.topic_order - b.topic_order,
  );
}
