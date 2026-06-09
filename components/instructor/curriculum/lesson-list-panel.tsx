"use client";

import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  FileText,
  GripVertical,
  Pencil,
  Plus,
  Video,
} from "lucide-react";
import type { CurriculumLesson } from "@/types/curriculum";
import { Button } from "@/components/ui/button";

interface LessonListPanelProps {
  lessons: CurriculumLesson[];
  selectedLessonId: string | null;
  isPending: boolean;
  onSelect: (lessonId: string) => void;
  onReorder: (lessons: CurriculumLesson[]) => void;
  onAddLesson: () => void;
  onTogglePublished: (lessonId: string, published: boolean) => void;
}

function SortableLessonRow({
  lesson,
  index,
  isSelected,
  onSelect,
  onTogglePublished,
}: {
  lesson: CurriculumLesson;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePublished: (published: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-white p-3 transition ${
        isSelected
          ? "border-[#D4AF37] shadow-sm"
          : "border-primary-100 hover:border-[#D4AF37]/50"
      } ${isDragging ? "opacity-70" : ""}`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-1 cursor-grab text-primary-400 active:cursor-grabbing"
          aria-label="Sürükle"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-xs text-primary-500">
            <span className="font-semibold text-[#0B1E3F]">#{index + 1}</span>
            {lesson.type === "video" ? (
              <Video className="h-3.5 w-3.5 text-[#D4AF37]" />
            ) : (
              <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
            )}
          </div>
          <p className="truncate text-sm font-medium text-[#0B1E3F]">
            {lesson.title}
          </p>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={lesson.published}
          aria-label="Yayında"
          onClick={() => onTogglePublished(!lesson.published)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${
            lesson.published ? "bg-[#D4AF37]" : "bg-primary-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
              lesson.published ? "left-5" : "left-0.5"
            }`}
          />
        </button>
      </div>

      <div className="mt-3 flex justify-end">
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onSelect}
          className="border-[#0B1E3F]/20 text-[#0B1E3F] hover:border-[#D4AF37] hover:text-[#0B1E3F]"
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" />
          Düzenle
        </Button>
      </div>
    </div>
  );
}

export function LessonListPanel({
  lessons,
  selectedLessonId,
  isPending,
  onSelect,
  onReorder,
  onAddLesson,
  onTogglePublished,
}: LessonListPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = lessons.findIndex((lesson) => lesson.id === active.id);
    const newIndex = lessons.findIndex((lesson) => lesson.id === over.id);
    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onReorder(arrayMove(lessons, oldIndex, newIndex));
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#0B1E3F]">Ders Listesi</h2>
        <span className="text-xs text-primary-500">{lessons.length} ders</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={lessons.map((lesson) => lesson.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {lessons.length === 0 ? (
              <p className="rounded-xl border border-dashed border-primary-200 p-6 text-center text-sm text-primary-500">
                Henüz ders yok. İlk dersinizi ekleyin.
              </p>
            ) : (
              lessons.map((lesson, index) => (
                <SortableLessonRow
                  key={lesson.id}
                  lesson={lesson}
                  index={index}
                  isSelected={lesson.id === selectedLessonId}
                  onSelect={() => onSelect(lesson.id)}
                  onTogglePublished={(published) =>
                    onTogglePublished(lesson.id, published)
                  }
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        onClick={onAddLesson}
        disabled={isPending}
        className="mt-4 w-full bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        Ders Ekle
      </Button>
    </section>
  );
}
