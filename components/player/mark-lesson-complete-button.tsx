"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Loader2 } from "lucide-react";
import { markLessonComplete } from "@/lib/actions/lesson-progress";
import { Button } from "@/components/ui/button";

interface MarkLessonCompleteButtonProps {
  lessonId: string;
  courseId: number;
  courseSlug: string;
  wpLessonId: number;
  isCompleted: boolean;
  showForManualTracking?: boolean;
}

export function MarkLessonCompleteButton({
  lessonId,
  courseId,
  courseSlug,
  wpLessonId,
  isCompleted,
  showForManualTracking = true,
}: MarkLessonCompleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (isCompleted || !showForManualTracking) {
    return null;
  }

  function handleClick() {
    startTransition(async () => {
      const result = await markLessonComplete({
        lessonId,
        courseId,
        courseSlug,
        wpLessonId,
      });

      if (result.success) {
        toast.success("Ders tamamlandı olarak işaretlendi");
        router.refresh();
      } else {
        toast.error(result.error ?? "İlerleme kaydedilemedi");
      }
    });
  }

  return (
    <div className="flex justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={isPending}
        className="border-green-200 bg-green-50 text-green-800 hover:bg-green-100 hover:text-green-900"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Kaydediliyor...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Tamamladım
          </>
        )}
      </Button>
    </div>
  );
}
