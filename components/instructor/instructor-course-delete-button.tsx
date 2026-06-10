"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteInstructorDraftCourse } from "@/lib/actions/instructor-courses";

interface InstructorCourseDeleteButtonProps {
  courseId: string;
  courseTitle: string;
}

export function InstructorCourseDeleteButton({
  courseId,
  courseTitle,
}: InstructorCourseDeleteButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = window.confirm(
      `"${courseTitle}" taslağını kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await deleteInstructorDraftCourse(courseId);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success("Kurs taslağı silindi.");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
      title="Taslağı sil"
    >
      <Trash2 className="h-4 w-4" />
      {pending ? "Siliniyor…" : "Sil"}
    </button>
  );
}
