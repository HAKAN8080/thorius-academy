"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { toast } from "sonner";
import { saveCourseBasics } from "@/lib/actions/instructor-courses";
import type { CourseBasicsInput, CoursesCache } from "@/types/instructor-course";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@uiw/react-md-editor/markdown-editor.css";
import {
  CourseBuilderNav,
  StepNavButtons,
} from "@/components/instructor/course-builder/course-builder-nav";

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface CourseBasicsFormProps {
  course: CoursesCache;
}

export function CourseBasicsForm({ course }: CourseBasicsFormProps) {
  const [form, setForm] = useState<CourseBasicsInput>({
    title: course.title,
    subtitle: course.subtitle ?? "",
    description_md: course.description_md ?? "",
    cover_image_url: course.cover_image_url ?? "",
    intro_video_url: course.intro_video_url ?? "",
    pricing_model: course.pricing_model ?? "free",
    price: Number(course.price ?? 0),
    sale_price: course.sale_price ? Number(course.sale_price) : null,
    level: course.level ?? "Başlangıç",
    language: course.language ?? "Türkçe",
    category: course.category ?? "",
    visibility: course.visibility ?? "public",
    published: course.published ?? false,
  });
  const [isPending, startTransition] = useTransition();

  function update<K extends keyof CourseBasicsInput>(
    key: K,
    value: CourseBasicsInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSave(nextPath?: string) {
    startTransition(async () => {
      const result = await saveCourseBasics(course.id, form);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      toast.success("Kaydedildi ✓");
      if (nextPath) {
        window.location.href = nextPath;
      }
    });
  }

  return (
    <div>
      <CourseBuilderNav courseId={course.id} current="basics" />

      <div className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="title">Kurs Başlığı</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Alt Başlık</Label>
            <Input
              id="subtitle"
              value={form.subtitle ?? ""}
              onChange={(e) => update("subtitle", e.target.value)}
            />
          </div>

          <div className="space-y-2" data-color-mode="light">
            <Label>Açıklama</Label>
            <MarkdownEditor
              value={form.description_md ?? ""}
              onChange={(value) => update("description_md", value ?? "")}
              height={220}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cover">Kapak Görseli URL</Label>
            <Input
              id="cover"
              value={form.cover_image_url ?? ""}
              onChange={(e) => update("cover_image_url", e.target.value)}
            />
            {form.cover_image_url ? (
              <div className="relative mt-2 h-40 w-full max-w-md overflow-hidden rounded-xl border border-primary-100">
                <Image
                  src={form.cover_image_url}
                  alt="Kapak önizleme"
                  fill
                  className="object-cover"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="intro">Tanıtım Videosu URL</Label>
            <Input
              id="intro"
              value={form.intro_video_url ?? ""}
              onChange={(e) => update("intro_video_url", e.target.value)}
              placeholder="Bunny CDN URL"
            />
          </div>

          <div className="space-y-2">
            <Label>Fiyatlandırma</Label>
            <div className="flex gap-3">
              {(["free", "paid"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("pricing_model", option)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium ${
                    form.pricing_model === option
                      ? "bg-[#0B1E3F] text-[#D4AF37]"
                      : "border border-primary-200 text-[#0B1E3F]"
                  }`}
                >
                  {option === "free" ? "Ücretsiz" : "Ücretli"}
                </button>
              ))}
            </div>
          </div>

          {form.pricing_model === "paid" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (TRY)</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  value={form.price ?? 0}
                  onChange={(e) => update("price", Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale">İndirimli Fiyat (TRY)</Label>
                <Input
                  id="sale"
                  type="number"
                  min={0}
                  value={form.sale_price ?? ""}
                  onChange={(e) =>
                    update(
                      "sale_price",
                      e.target.value ? Number(e.target.value) : null,
                    )
                  }
                />
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="level">Seviye</Label>
              <select
                id="level"
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
                className="h-10 w-full rounded-md border border-primary-200 px-3 text-sm"
              >
                <option>Başlangıç</option>
                <option>Orta</option>
                <option>İleri</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <select
                id="language"
                value={form.language}
                onChange={(e) => update("language", e.target.value)}
                className="h-10 w-full rounded-md border border-primary-200 px-3 text-sm"
              >
                <option>Türkçe</option>
                <option>İngilizce</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori</Label>
            <Input
              id="category"
              value={form.category ?? ""}
              onChange={(e) => update("category", e.target.value)}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
              <span className="text-sm font-medium text-[#0B1E3F]">
                Görünürlük: {form.visibility === "public" ? "Herkese Açık" : "Gizli"}
              </span>
              <input
                type="checkbox"
                checked={form.visibility === "public"}
                onChange={(e) =>
                  update("visibility", e.target.checked ? "public" : "private")
                }
              />
            </label>
            <label className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
              <span className="text-sm font-medium text-[#0B1E3F]">Yayında</span>
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => update("published", e.target.checked)}
              />
            </label>
          </div>
        </div>

        <StepNavButtons
          nextHref={`/instructor/courses/${course.id}/curriculum`}
          nextLabel="İleri →"
          showUpdate
          isPending={isPending}
          onUpdate={() => handleSave()}
        />

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            disabled={isPending}
            onClick={() =>
              handleSave(`/instructor/courses/${course.id}/curriculum`)
            }
            className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-semibold text-[#0B1E3F]"
          >
            Kaydet ve İlerle →
          </button>
        </div>
      </div>
    </div>
  );
}
