"use client";

import { useMemo, useState, useTransition } from "react";
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
  ChevronDown,
  ChevronRight,
  FileText,
  GripVertical,
  Pencil,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import type { BuilderLesson, BuilderLessonInput, CourseSection } from "@/types/instructor-course";
import {
  createBuilderLesson,
  createSection,
  deleteSection,
  reorderBuilderLessons,
  reorderSections,
  saveBuilderLesson,
  toggleBuilderLessonPublished,
  updateSectionTitle,
} from "@/lib/actions/instructor-builder";
import { Button } from "@/components/ui/button";
import { BuilderLessonForm } from "@/components/instructor/course-builder/builder-lesson-form";
import {
  CourseBuilderNav,
  StepNavButtons,
} from "@/components/instructor/course-builder/course-builder-nav";

interface BuilderCurriculumEditorProps {
  courseCacheId: string;
  courseTitle: string;
  initialSections: CourseSection[];
  initialLessons: BuilderLesson[];
}

function SortableLessonRow({
  lesson,
  index,
  isSelected,
  onSelect,
  onTogglePublished,
}: {
  lesson: BuilderLesson;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onTogglePublished: (published: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`flex items-center gap-2 rounded-lg border px-2 py-2 ${
        isSelected ? "border-[#D4AF37] bg-[#0B1E3F]/5" : "border-primary-100"
      } ${isDragging ? "opacity-70" : ""}`}
    >
      <button
        type="button"
        className="cursor-grab text-primary-400"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 text-xs font-semibold text-primary-500">{index + 1}</span>
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 truncate text-left text-sm text-[#0B1E3F]"
      >
        {lesson.title}
      </button>
      {lesson.type === "video" ? (
        <Video className="h-3.5 w-3.5 text-[#D4AF37]" />
      ) : (
        <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
      )}
      {lesson.is_free_preview ? (
        <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
          Free
        </span>
      ) : null}
      <input
        type="checkbox"
        checked={lesson.published}
        onChange={(e) => onTogglePublished(e.target.checked)}
        aria-label="Published"
      />
    </div>
  );
}

function buildOrderedLessonIds(
  orderedSections: CourseSection[],
  allLessons: BuilderLesson[],
  sectionOverrides: Map<string, BuilderLesson[]> = new Map(),
): string[] {
  const ids: string[] = [];

  for (const section of orderedSections) {
    const sectionLessons =
      sectionOverrides.get(section.id) ??
      allLessons
        .filter((lesson) => lesson.section_id === section.id)
        .sort((a, b) => a.sort_order - b.sort_order);
    ids.push(...sectionLessons.map((lesson) => lesson.id));
  }

  return ids;
}

function SortableSection({
  section,
  children,
}: {
  section: CourseSection;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={isDragging ? "opacity-70" : ""}
    >
      <div className="mb-1 flex items-center gap-1">
        <button
          type="button"
          className="cursor-grab text-primary-400"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="text-xs text-primary-500">Bölüm</span>
      </div>
      {children}
    </div>
  );
}

function SectionBlock({
  section,
  lessons,
  selectedLessonId,
  collapsed,
  onToggleCollapse,
  onSelectLesson,
  onTogglePublished,
  onEditTitle,
  onDelete,
  onAddLesson,
  onReorderLessons,
}: {
  section: CourseSection;
  lessons: BuilderLesson[];
  selectedLessonId: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSelectLesson: (id: string) => void;
  onTogglePublished: (lessonId: string, published: boolean) => void;
  onEditTitle: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onReorderLessons: (sectionId: string, next: BuilderLesson[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = lessons.findIndex((l) => l.id === active.id);
    const newIndex = lessons.findIndex((l) => l.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    onReorderLessons(section.id, arrayMove(lessons, oldIndex, newIndex));
  }

  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/40 p-3">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onToggleCollapse}>
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-[#0B1E3F]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#0B1E3F]" />
          )}
        </button>
        <p className="flex-1 truncate text-sm font-semibold text-[#0B1E3F]">
          {section.title}
        </p>
        <button type="button" onClick={onEditTitle} aria-label="Edit section">
          <Pencil className="h-3.5 w-3.5 text-primary-500" />
        </button>
        <button type="button" onClick={onDelete} aria-label="Delete section">
          <Trash2 className="h-3.5 w-3.5 text-red-500" />
        </button>
      </div>

      {!collapsed ? (
        <>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={lessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <SortableLessonRow
                    key={lesson.id}
                    lesson={lesson}
                    index={index}
                    isSelected={lesson.id === selectedLessonId}
                    onSelect={() => onSelectLesson(lesson.id)}
                    onTogglePublished={(published) =>
                      onTogglePublished(lesson.id, published)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAddLesson}
            className="mt-3 w-full border-[#0B1E3F]/20 text-[#0B1E3F]"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Lesson
          </Button>
        </>
      ) : null}
    </div>
  );
}

export function BuilderCurriculumEditor({
  courseCacheId,
  courseTitle,
  initialSections,
  initialLessons,
}: BuilderCurriculumEditorProps) {
  const [sections, setSections] = useState(initialSections);
  const [lessons, setLessons] = useState(initialLessons);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    initialLessons[0]?.id ?? null,
  );
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>(
    {},
  );
  const [isPending, startTransition] = useTransition();

  const lessonsBySection = useMemo(() => {
    const map = new Map<string, BuilderLesson[]>();
    for (const section of sections) {
      map.set(
        section.id,
        lessons
          .filter((l) => l.section_id === section.id)
          .sort((a, b) => a.sort_order - b.sort_order),
      );
    }
    return map;
  }, [sections, lessons]);

  const selectedLesson = useMemo(
    () => lessons.find((l) => l.id === selectedLessonId) ?? null,
    [lessons, selectedLessonId],
  );

  function handleAddSection() {
    startTransition(async () => {
      const result = await createSection(courseCacheId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSections((current) => [...current, result.section]);
      toast.success("Bölüm eklendi ✓");
    });
  }

  function handleReorderSections(next: CourseSection[]) {
    setSections(next);
    startTransition(async () => {
      const result = await reorderSections(
        courseCacheId,
        next.map((s) => s.id),
      );
      if ("error" in result) toast.error(result.error);
      else toast.success("Sıralama kaydedildi ✓");
    });
  }

  function handleSectionDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sections.findIndex((s) => s.id === active.id);
    const newIndex = sections.findIndex((s) => s.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    handleReorderSections(arrayMove(sections, oldIndex, newIndex));
  }

  function handleAddLesson(sectionId: string) {
    startTransition(async () => {
      const result = await createBuilderLesson(courseCacheId, sectionId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLessons((current) => [...current, result.lesson]);
      setSelectedLessonId(result.lesson.id);
      toast.success("Ders eklendi ✓");
    });
  }

  function handleReorderLessons(sectionId: string, sectionLessons: BuilderLesson[]) {
    const others = lessons.filter((lesson) => lesson.section_id !== sectionId);
    const updated = [
      ...others,
      ...sectionLessons.map((lesson, index) => ({
        ...lesson,
        sort_order: index + 1,
      })),
    ];
    setLessons(updated);

    const overrides = new Map<string, BuilderLesson[]>();
    overrides.set(sectionId, sectionLessons);
    const orderedIds = buildOrderedLessonIds(sections, updated, overrides);

    startTransition(async () => {
      const result = await reorderBuilderLessons(courseCacheId, orderedIds);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Sıralama kaydedildi ✓");
    });
  }

  function handleSaveLesson(input: BuilderLessonInput) {
    startTransition(async () => {
      const result = await saveBuilderLesson(input);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLessons((current) =>
        current.map((l) => (l.id === result.lesson.id ? result.lesson : l)),
      );
      toast.success("Saved ✓");
    });
  }

  function handleTogglePublished(lessonId: string, published: boolean) {
    startTransition(async () => {
      const result = await toggleBuilderLessonPublished(
        courseCacheId,
        lessonId,
        published,
      );
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setLessons((current) =>
        current.map((l) => (l.id === result.lesson.id ? result.lesson : l)),
      );
    });
  }

  function handleEditSectionTitle(section: CourseSection) {
    const title = window.prompt("Bölüm adı", section.title);
    if (!title?.trim()) return;

    startTransition(async () => {
      const result = await updateSectionTitle(section.id, courseCacheId, title);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSections((current) =>
        current.map((s) =>
          s.id === section.id ? { ...s, title: title.trim() } : s,
        ),
      );
    });
  }

  function handleDeleteSection(sectionId: string) {
    if (!window.confirm("Bu bölüm silinsin mi?")) return;

    startTransition(async () => {
      const result = await deleteSection(sectionId, courseCacheId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setSections((current) => current.filter((s) => s.id !== sectionId));
      setLessons((current) =>
        current.filter((l) => l.section_id !== sectionId),
      );
      toast.success("Bölüm silindi");
    });
  }

  const sectionSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  return (
    <div>
      <CourseBuilderNav courseId={courseCacheId} current="curriculum" />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0B1E3F]">{courseTitle}</h1>
        <p className="mt-1 text-sm text-primary-600">
          Bölümleri ve dersleri sürükleyerek düzenleyin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <section className="rounded-2xl border border-primary-100 bg-white p-4 shadow-sm">
          <DndContext
            sensors={sectionSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSectionDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {sections.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-primary-200 p-6 text-center text-sm text-primary-500">
                    Henüz bölüm yok. İlk bölümünüzü ekleyin.
                  </p>
                ) : (
                  sections.map((section) => (
                    <SortableSection key={section.id} section={section}>
                      <SectionBlock
                        section={section}
                        lessons={lessonsBySection.get(section.id) ?? []}
                        selectedLessonId={selectedLessonId}
                        collapsed={collapsedSections[section.id] ?? false}
                        onToggleCollapse={() =>
                          setCollapsedSections((current) => ({
                            ...current,
                            [section.id]: !current[section.id],
                          }))
                        }
                        onSelectLesson={setSelectedLessonId}
                        onTogglePublished={handleTogglePublished}
                        onEditTitle={() => handleEditSectionTitle(section)}
                        onDelete={() => handleDeleteSection(section.id)}
                        onAddLesson={() => handleAddLesson(section.id)}
                        onReorderLessons={handleReorderLessons}
                      />
                    </SortableSection>
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>

          <Button
            type="button"
            onClick={handleAddSection}
            disabled={isPending}
            className="mt-4 w-full bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Topic
          </Button>
        </section>

        <BuilderLessonForm
          courseCacheId={courseCacheId}
          lesson={selectedLesson}
          isPending={isPending}
          onSave={handleSaveLesson}
        />
      </div>

      <StepNavButtons
        previousHref={`/instructor/courses/${courseCacheId}/basics`}
        nextHref={`/instructor/courses/${courseCacheId}/additional`}
        nextLabel="Next →"
      />
    </div>
  );
}
