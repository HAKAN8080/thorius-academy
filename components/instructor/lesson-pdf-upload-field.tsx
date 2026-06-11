"use client";

import { useRef, useTransition } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { uploadLessonPdfAttachment } from "@/lib/actions/instructor-lesson-uploads";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface LessonPdfUploadFieldProps {
  attachmentUrl: string;
  attachmentName: string;
  onChange: (next: { url: string; name: string } | null) => void;
  courseCacheId?: string;
  wpCourseId?: number;
  lessonId: string;
  disabled?: boolean;
}

export function LessonPdfUploadField({
  attachmentUrl,
  attachmentName,
  onChange,
  courseCacheId,
  wpCourseId,
  lessonId,
  disabled = false,
}: LessonPdfUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      const result = await uploadLessonPdfAttachment({
        courseCacheId,
        wpCourseId,
        lessonId,
        formData,
      });
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      onChange({ url: result.url, name: result.name });
      toast.success("PDF yüklendi.");
    });

    event.target.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>Ek PDF</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          disabled={disabled || isPending}
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={disabled || isPending}
          onClick={() => inputRef.current?.click()}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isPending
            ? "Yükleniyor..."
            : attachmentUrl
              ? "PDF Değiştir"
              : "PDF Yükle"}
        </Button>
        {attachmentUrl ? (
          <Button
            type="button"
            variant="ghost"
            disabled={disabled || isPending}
            onClick={() => onChange(null)}
            className="text-red-600 hover:text-red-700"
          >
            Kaldır
          </Button>
        ) : null}
      </div>
      <p className="text-xs text-primary-500">
        Yalnızca PDF · en fazla 20 MB · saatte sınırlı yükleme uygulanır.
      </p>
      {attachmentUrl ? (
        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#0B1E3F] underline"
        >
          <FileText className="h-4 w-4" />
          {attachmentName || "Ek PDF"}
        </a>
      ) : null}
    </div>
  );
}
