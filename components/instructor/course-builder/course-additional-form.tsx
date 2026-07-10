"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveCourseAdditional } from "@/lib/actions/instructor-courses";
import type { CourseAdditionalInput, CoursesCache } from "@/types/instructor-course";
import { Label } from "@/components/ui/label";
import {
  CourseBuilderNav,
  StepNavButtons,
} from "@/components/instructor/course-builder/course-builder-nav";

interface CourseAdditionalFormProps {
  course: CoursesCache;
}

export function CourseAdditionalForm({ course }: CourseAdditionalFormProps) {
  const [form, setForm] = useState<CourseAdditionalInput>({
    what_will_learn: course.what_will_learn ?? "",
    target_audience: course.target_audience ?? "",
    what_will_learn_en: course.what_will_learn_en ?? "",
    target_audience_en: course.target_audience_en ?? "",
  });
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      const result = await saveCourseAdditional(course.id, form);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Kaydedildi ✓");
    });
  }

  return (
    <div>
      <CourseBuilderNav courseId={course.id} current="additional" />

      <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="learn">Neler Öğreneceksiniz?</Label>
            <textarea
              id="learn"
              rows={8}
              value={form.what_will_learn ?? ""}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  what_will_learn: e.target.value,
                }))
              }
              placeholder="Her satıra bir fayda yazın"
              className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Hedef Kitle</Label>
            <textarea
              id="audience"
              rows={8}
              value={form.target_audience ?? ""}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  target_audience: e.target.value,
                }))
              }
              placeholder="Her satıra bir hedef kitle maddesi yazın"
              className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm"
            />
          </div>

          <div className="rounded-xl border border-dashed border-primary-200 bg-primary-50/40 p-4">
            <p className="mb-4 text-sm font-semibold text-primary-900">
              English (optional)
            </p>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="learn_en">What You Will Learn (EN)</Label>
                <textarea
                  id="learn_en"
                  rows={6}
                  value={form.what_will_learn_en ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      what_will_learn_en: e.target.value,
                    }))
                  }
                  placeholder="One benefit per line"
                  className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="audience_en">Target Audience (EN)</Label>
                <textarea
                  id="audience_en"
                  rows={6}
                  value={form.target_audience_en ?? ""}
                  onChange={(e) =>
                    setForm((current) => ({
                      ...current,
                      target_audience_en: e.target.value,
                    }))
                  }
                  placeholder="One audience segment per line"
                  className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <StepNavButtons
          previousHref={`/instructor/courses/${course.id}/curriculum`}
          showUpdate
          isPending={isPending}
          onUpdate={handleSave}
        />
      </div>
    </div>
  );
}
