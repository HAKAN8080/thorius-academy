"use client";

import { useMemo, useState } from "react";
import type { CareerPathAdminInput } from "@/lib/career-path/types";
import type { AdminCourseOption } from "@/lib/career-path/admin-course-options";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Step = CareerPathAdminInput["steps"][number];

interface AdminPathStepFieldsProps {
  step: Step;
  index: number;
  courses: AdminCourseOption[];
  onUpdate: (
    index: number,
    field: keyof Step,
    value: string | number,
  ) => void;
  onSelectCourse: (index: number, slug: string) => void;
}

export function AdminPathStepFields({
  step,
  index,
  courses,
  onUpdate,
  onSelectCourse,
}: AdminPathStepFieldsProps) {
  const [courseSearch, setCourseSearch] = useState("");
  const [showManualSlug, setShowManualSlug] = useState(false);

  const filteredCourses = useMemo(() => {
    const query = courseSearch.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.slug.toLowerCase().includes(query) ||
        course.categoryLabel?.toLowerCase().includes(query),
    );
  }, [courseSearch, courses]);

  const selectedCourse = courses.find(
    (course) => course.slug === step.courseSlug,
  );

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Seviye etiketi</Label>
        <Input
          value={step.level}
          onChange={(event) => onUpdate(index, "level", event.target.value)}
          placeholder="Başlangıç"
        />
      </div>
      <div className="space-y-2">
        <Label>Adım başlığı</Label>
        <Input
          value={step.label}
          onChange={(event) => onUpdate(index, "label", event.target.value)}
          placeholder="Örn. Perakende Planlamaya Giriş"
          required
        />
      </div>

      <div className="space-y-2 md:col-span-2">
        <Label htmlFor={`course-search-${index}`}>Kurs seç</Label>
        <Input
          id={`course-search-${index}`}
          value={courseSearch}
          onChange={(event) => setCourseSearch(event.target.value)}
          placeholder="Kurs adı veya slug ile ara…"
        />
        <select
          id={`course-select-${index}`}
          value={step.courseSlug}
          onChange={(event) => onSelectCourse(index, event.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          required
        >
          <option value="">Katalogdan kurs seçin</option>
          {filteredCourses.map((course) => (
            <option key={course.slug} value={course.slug}>
              {course.title}
              {course.categoryLabel ? ` (${course.categoryLabel})` : ""}
            </option>
          ))}
        </select>
        {selectedCourse ? (
          <p className="text-xs text-muted-foreground">
            Seçili: <span className="font-medium">{selectedCourse.title}</span> ·{" "}
            <code className="rounded bg-primary-50 px-1">{selectedCourse.slug}</code>
          </p>
        ) : step.courseSlug ? (
          <p className="text-xs text-amber-700">
            Katalogda eşleşme yok; slug elle girilmiş olabilir.
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => setShowManualSlug((current) => !current)}
          className="text-xs font-medium text-primary-700 hover:text-primary-950"
        >
          {showManualSlug ? "Slug alanını gizle" : "Slug’ı elle düzenle"}
        </button>
      </div>

      {showManualSlug ? (
        <>
          <div className="space-y-2">
            <Label>Kurs slug</Label>
            <Input
              value={step.courseSlug}
              onChange={(event) =>
                onUpdate(index, "courseSlug", event.target.value)
              }
              placeholder="perakende-planlamaya-giris"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Yedek kurs adı</Label>
            <Input
              value={step.fallbackTitle}
              onChange={(event) =>
                onUpdate(index, "fallbackTitle", event.target.value)
              }
              placeholder="Kurs kataloğunda görünen ad"
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2 md:col-span-2">
        <Label>Açıklama</Label>
        <textarea
          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={step.description}
          onChange={(event) =>
            onUpdate(index, "description", event.target.value)
          }
          placeholder="Bu adımda öğrenilecekler"
        />
      </div>
    </div>
  );
}
