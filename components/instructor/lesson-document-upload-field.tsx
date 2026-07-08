"use client";

import { useRef, useTransition } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  uploadLessonExcelAttachment,
  uploadLessonPdfAttachment,
} from "@/lib/actions/instructor-lesson-uploads";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type LessonDocumentKind = "pdf" | "excel";

const DOCUMENT_CONFIG: Record<
  LessonDocumentKind,
  {
    label: string;
    accept: string;
    hint: string;
    defaultName: string;
    icon: typeof FileText;
    upload: typeof uploadLessonPdfAttachment;
    successMessage: string;
    emptyError: string;
    changeLabel: string;
    uploadLabel: string;
  }
> = {
  pdf: {
    label: "Ek PDF",
    accept: "application/pdf,.pdf",
    hint: "Yalnızca PDF · en fazla 20 MB · saatte sınırlı yükleme uygulanır.",
    defaultName: "Ek PDF",
    icon: FileText,
    upload: uploadLessonPdfAttachment,
    successMessage: "PDF yüklendi.",
    emptyError: "Lütfen bir PDF seçin.",
    changeLabel: "PDF Değiştir",
    uploadLabel: "PDF Yükle",
  },
  excel: {
    label: "Excel Şablonu",
    accept:
      ".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel",
    hint: "XLSX veya XLS · en fazla 20 MB · saatte sınırlı yükleme uygulanır.",
    defaultName: "Excel Şablonu",
    icon: FileSpreadsheet,
    upload: uploadLessonExcelAttachment,
    successMessage: "Excel şablonu yüklendi.",
    emptyError: "Lütfen bir Excel dosyası seçin.",
    changeLabel: "Excel Değiştir",
    uploadLabel: "Excel Yükle",
  },
};

interface LessonDocumentUploadFieldProps {
  kind: LessonDocumentKind;
  attachmentUrl: string;
  attachmentName: string;
  onChange: (next: { url: string; name: string } | null) => void;
  courseCacheId?: string;
  wpCourseId?: number;
  lessonId: string;
  disabled?: boolean;
}

export function LessonDocumentUploadField({
  kind,
  attachmentUrl,
  attachmentName,
  onChange,
  courseCacheId,
  wpCourseId,
  lessonId,
  disabled = false,
}: LessonDocumentUploadFieldProps) {
  const config = DOCUMENT_CONFIG[kind];
  const Icon = config.icon;
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
      const result = await config.upload({
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
      toast.success(config.successMessage);
    });

    event.target.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>{config.label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept={config.accept}
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
          <Icon className="mr-2 h-4 w-4" />
          {isPending
            ? "Yükleniyor..."
            : attachmentUrl
              ? config.changeLabel
              : config.uploadLabel}
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
      <p className="text-xs text-primary-500">{config.hint}</p>
      {attachmentUrl ? (
        <a
          href={attachmentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-[#0B1E3F] underline"
        >
          <Icon className="h-4 w-4" />
          {attachmentName || config.defaultName}
        </a>
      ) : null}
    </div>
  );
}
