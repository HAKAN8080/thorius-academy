"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { CurriculumLesson, CurriculumLessonInput } from "@/types/curriculum";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface LessonEditFormProps {
  courseId: number;
  lesson: CurriculumLesson | null;
  isPending: boolean;
  onSave: (input: CurriculumLessonInput) => void;
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-primary-100 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#0B1E3F]">{label}</p>
        {description ? (
          <p className="text-xs text-primary-500">{description}</p>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-[#D4AF37]" : "bg-primary-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function LessonEditForm({
  courseId,
  lesson,
  isPending,
  onSave,
}: LessonEditFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "text">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [published, setPublished] = useState(true);

  useEffect(() => {
    if (!lesson) {
      return;
    }

    setTitle(lesson.title);
    setType(lesson.type);
    setVideoUrl(lesson.video_url ?? "");
    setContentMd(lesson.content_md ?? "");
    setIsFreePreview(lesson.is_free_preview);
    setPublished(lesson.published);
  }, [lesson]);

  if (!lesson) {
    return (
      <section className="flex min-h-[420px] items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-white p-8 text-center">
        <p className="text-sm text-primary-500">
          Düzenlemek için soldan bir ders seçin veya yeni ders ekleyin.
        </p>
      </section>
    );
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!lesson) {
      return;
    }

    onSave({
      id: lesson.id,
      course_id: courseId,
      title,
      type,
      video_url: type === "video" ? videoUrl : null,
      content_md: type === "text" ? contentMd : null,
      is_free_preview: isFreePreview,
      published,
    });
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-[#0B1E3F]">Ders Düzenle</h2>
        <p className="text-sm text-primary-500">
          Değişiklikler kaydedildiğinde anında uygulanır.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="lesson-title">Başlık</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            placeholder="Ders başlığı"
            className="border-primary-200"
          />
        </div>

        <div className="space-y-2">
          <Label>Ders Tipi</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["video", "text"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  type === option
                    ? "border-[#D4AF37] bg-[#0B1E3F] text-[#D4AF37]"
                    : "border-primary-200 text-[#0B1E3F] hover:border-[#D4AF37]/60"
                }`}
              >
                {option === "video" ? "Video" : "Metin"}
              </button>
            ))}
          </div>
        </div>

        {type === "video" ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                value={videoUrl}
                onChange={(event) => setVideoUrl(event.target.value)}
                placeholder="YouTube, Vimeo veya MP4 bağlantısı"
                className="border-primary-200"
              />
              <p className="text-xs text-primary-500">
                Süre kayıt sırasında video kaynağından otomatik hesaplanır.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-2" data-color-mode="light">
            <Label>Metin İçeriği</Label>
            <div className="overflow-hidden rounded-xl border border-primary-200">
              <MarkdownEditor
                value={contentMd}
                onChange={(value) => setContentMd(value ?? "")}
                height={280}
                preview="edit"
              />
            </div>
          </div>
        )}

        <ToggleField
          label="Ücretsiz Önizleme"
          description="Kayıt olmadan görüntülenebilir"
          checked={isFreePreview}
          onChange={setIsFreePreview}
        />

        <ToggleField
          label="Yayında"
          description="Öğrencilere görünür"
          checked={published}
          onChange={setPublished}
        />

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90 sm:w-auto"
        >
          Kaydet
        </Button>
      </form>
    </section>
  );
}
