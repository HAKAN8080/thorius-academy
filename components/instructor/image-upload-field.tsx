"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  onUpload: (formData: FormData) => Promise<{ url: string } | { error: string }>;
  disabled?: boolean;
  previewAlt?: string;
  hint?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  onUpload,
  disabled = false,
  previewAlt = "Görsel önizleme",
  hint = "JPG, PNG veya WebP · en fazla 5 MB",
}: ImageUploadFieldProps) {
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
      const result = await onUpload(formData);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      onChange(result.url);
      toast.success("Görsel yüklendi");
    });

    event.target.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
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
          {isPending ? "Yükleniyor..." : value ? "Görseli Değiştir" : "Görsel Yükle"}
        </Button>
        {value ? (
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
      <p className="text-xs text-primary-500">{hint}</p>
      {value ? (
        <div className="mt-2 flex h-48 w-full max-w-md items-center justify-center overflow-hidden rounded-xl border border-primary-100 bg-primary-50 p-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- remote upload preview; fit any aspect ratio */}
          <img
            src={value}
            alt={previewAlt}
            className="h-full w-full object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
