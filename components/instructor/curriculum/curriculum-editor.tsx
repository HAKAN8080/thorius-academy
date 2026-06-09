"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import type { CurriculumCourse, CurriculumLesson } from "@/types/curriculum";
import {
  createCurriculumLesson,
  reorderCurriculumLessons,
  saveCurriculumLesson,
  toggleCurriculumLessonPublished,
} from "@/lib/actions/instructor-curriculum";
import { LessonListPanel } from "@/components/instructor/curriculum/lesson-list-panel";
import { LessonEditForm } from "@/components/instructor/curriculum/lesson-edit-form";

interface CurriculumEditorProps {
  course: CurriculumCourse;
  initialLessons: CurriculumLesson[];
}

export function CurriculumEditor({
  course,
  initialLessons,
}: CurriculumEditorProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    initialLessons[0]?.id ?? null,
  );
  const [isPending, startTransition] = useTransition();

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  function handleReorder(nextLessons: CurriculumLesson[]) {
    setLessons(nextLessons);
    startTransition(async () => {
      const result = await reorderCurriculumLessons(
        course.course_id,
        nextLessons.map((lesson) => lesson.id),
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Sıralama kaydedildi ✓");
    });
  }

  function handleAddLesson() {
    startTransition(async () => {
      const result = await createCurriculumLesson(course.course_id);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setLessons((current) => [...current, result.lesson]);
      setSelectedLessonId(result.lesson.id);
      toast.success("Yeni ders eklendi ✓");
    });
  }

  function handleSaveLesson(input: Parameters<typeof saveCurriculumLesson>[0]) {
    startTransition(async () => {
      const result = await saveCurriculumLesson(input);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === result.lesson.id ? result.lesson : lesson,
        ),
      );
      toast.success("Saved ✓");
    });
  }

  function handleTogglePublished(lessonId: string, published: boolean) {
    startTransition(async () => {
      const result = await toggleCurriculumLessonPublished(
        lessonId,
        course.course_id,
        published,
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setLessons((current) =>
        current.map((lesson) =>
          lesson.id === result.lesson.id ? result.lesson : lesson,
        ),
      );
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <LessonListPanel
        lessons={lessons}
        selectedLessonId={selectedLessonId}
        isPending={isPending}
        onSelect={setSelectedLessonId}
        onReorder={handleReorder}
        onAddLesson={handleAddLesson}
        onTogglePublished={handleTogglePublished}
      />

      <LessonEditForm
        courseId={course.course_id}
        lesson={selectedLesson}
        isPending={isPending}
        onSave={handleSaveLesson}
      />
    </div>
  );
}
