"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { createInstructorCourse } from "@/lib/actions/instructor-courses";
import { Button } from "@/components/ui/button";

export function NewCourseButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    setError(null);
    startTransition(async () => {
      try {
        const { id } = await createInstructorCourse();
        router.push(`/instructor/courses/${id}/basics`);
        router.refresh();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Kurs oluşturulamadı.";
        setError(message);
        console.error("[NewCourseButton]", err);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        disabled={pending}
        onClick={handleCreate}
        className={`bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90 ${className}`}
      >
        <Plus className="mr-2 h-4 w-4" />
        {pending ? "Oluşturuluyor..." : "New Course"}
      </Button>
      {error ? (
        <p className="max-w-[220px] text-right text-xs text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
