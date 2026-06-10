"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Trash2 } from "lucide-react";
import type { BuilderLesson, BuilderLessonInput } from "@/types/instructor-course";
import { uploadLessonFeaturedImage } from "@/lib/actions/instructor-media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/instructor/image-upload-field";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface BuilderLessonFormProps {
  courseCacheId: string;
  lesson: BuilderLesson | null;
  isPending: boolean;
  onSave: (input: BuilderLessonInput) => void;
  onDelete?: (lessonId: string) => void;
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
      <span className="text-sm font-medium text-[#0B1E3F]">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function BuilderLessonForm({
  courseCacheId,
  lesson,
  isPending,
  onSave,
  onDelete,
}: BuilderLessonFormProps) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"video" | "text">("video");
  const [videoUrl, setVideoUrl] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [isFreePreview, setIsFreePreview] = useState(false);
  const [published, setPublished] = useState(false);

  useEffect(() => {
    if (!lesson) return;
    setTitle(lesson.title);
    setType(lesson.type);
    setVideoUrl(lesson.video_url ?? "");
    setContentMd(lesson.content_md ?? "");
    setFeaturedImageUrl(lesson.featured_image_url ?? "");
    setAttachmentUrl(lesson.attachment_url ?? "");
    setAttachmentName(lesson.attachment_name ?? "");
    setIsFreePreview(lesson.is_free_preview);
    setPublished(lesson.published);
  }, [lesson]);

  if (!lesson) {
    return (
      <section className="flex min-h-[480px] items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-white p-8 text-center">
        <p className="text-sm text-primary-500">
          Düzenlemek için soldan bir ders seçin.
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
      course_cache_id: courseCacheId,
      section_id: lesson.section_id,
      title,
      type,
      video_url: type === "video" ? videoUrl : null,
      content_md: type === "text" ? contentMd : null,
      featured_image_url: featuredImageUrl || null,
      attachment_url: attachmentUrl || null,
      attachment_name: attachmentName || null,
      is_free_preview: isFreePreview,
      published,
    });
  }

  return (
    <section className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm lg:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#0B1E3F]">Ders Düzenle</h2>
        {onDelete ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={() => onDelete(lesson.id)}
            className="border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Dersi Sil
          </Button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="lesson-title">Ders Adı</Label>
          <Input
            id="lesson-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Tür</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["video", "text"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium ${
                  type === option
                    ? "border-[#D4AF37] bg-[#0B1E3F] text-[#D4AF37]"
                    : "border-primary-200 text-[#0B1E3F]"
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
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="YouTube, Vimeo veya Bunny CDN URL"
              />
              <p className="text-xs text-primary-500">
                Süre kayıt sırasında video kaynağından otomatik hesaplanır.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-2" data-color-mode="light">
            <Label>İçerik</Label>
            <MarkdownEditor
              value={contentMd}
              onChange={(value) => setContentMd(value ?? "")}
              height={260}
              preview="edit"
            />
          </div>
        )}

        <ImageUploadField
          label="Kapak Görseli"
          value={featuredImageUrl || null}
          onChange={(url) => setFeaturedImageUrl(url ?? "")}
          onUpload={(uploadFormData) =>
            uploadLessonFeaturedImage(courseCacheId, lesson.id, uploadFormData)
          }
          disabled={isPending}
          previewAlt="Ders kapak önizleme"
        />

        <div className="space-y-2">
          <Label htmlFor="attachment">Ek Dosya URL</Label>
          <Input
            id="attachment"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
            placeholder="Dosya URL"
          />
          <Input
            value={attachmentName}
            onChange={(e) => setAttachmentName(e.target.value)}
            placeholder="Dosya adı (opsiyonel)"
          />
        </div>

        <ToggleField
          label="Ücretsiz önizleme"
          checked={isFreePreview}
          onChange={setIsFreePreview}
        />
        <ToggleField label="Yayında" checked={published} onChange={setPublished} />

        <Button
          type="submit"
          disabled={isPending}
          className="bg-[#0B1E3F] text-[#D4AF37] hover:bg-[#0B1E3F]/90"
        >
          Kaydet
        </Button>
      </form>
    </section>
  );
}
