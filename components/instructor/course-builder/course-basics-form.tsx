"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import {
  BookOpen,
  FileText,
  ImageIcon,
  Search,
  Sparkles,
  Tag,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { saveCourseBasics } from "@/lib/actions/instructor-courses";
import { uploadCourseCoverImage } from "@/lib/actions/instructor-media";
import { buildCourseSeoDefaults } from "@/lib/instructor/course-seo-defaults";
import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";
import type { CourseBasicsInput, CoursesCache } from "@/types/instructor-course";
import type { WPCategory } from "@/types/wordpress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/instructor/image-upload-field";
import {
  CourseBuilderSection,
  CourseSeoPreview,
} from "@/components/instructor/course-builder/course-builder-section";
import {
  CourseBuilderNav,
  StepNavButtons,
} from "@/components/instructor/course-builder/course-builder-nav";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface CourseBasicsFormProps {
  course: CoursesCache;
  categories: WPCategory[];
}

function countLabel(value: string | null | undefined, max: number): string {
  const length = value?.length ?? 0;
  return `${length}/${max}`;
}

export function CourseBasicsForm({ course, categories }: CourseBasicsFormProps) {
  const seoDefaults = useMemo(
    () =>
      buildCourseSeoDefaults({
        title: course.title,
        subtitle: course.subtitle,
        description_md: course.description_md,
        category: course.category,
      }),
    [course.title, course.subtitle, course.description_md, course.category],
  );

  const [form, setForm] = useState<CourseBasicsInput>({
    title: course.title,
    course_slug: course.course_slug ?? "",
    subtitle: course.subtitle ?? "",
    description_md: course.description_md ?? "",
    title_en: course.title_en ?? "",
    subtitle_en: course.subtitle_en ?? "",
    description_md_en: course.description_md_en ?? "",
    cover_image_url: course.cover_image_url ?? "",
    intro_video_url: course.intro_video_url ?? "",
    pricing_model: course.pricing_model ?? "free",
    price: Number(course.price ?? 0),
    sale_price: course.sale_price ? Number(course.sale_price) : null,
    level: course.level ?? "Başlangıç",
    language: course.language ?? "Türkçe",
    subtitle_language: course.subtitle_language ?? null,
    category: course.category ?? "",
    visibility: course.visibility ?? "public",
    seo_title: course.seo_title ?? seoDefaults.seo_title,
    seo_description: course.seo_description ?? seoDefaults.seo_description,
    seo_focus_keyword: course.seo_focus_keyword ?? seoDefaults.seo_focus_keyword,
    published: course.published ?? false,
  });
  const [isPending, startTransition] = useTransition();

  const previewUrl = form.course_slug
    ? `https://thorius.com.tr/kurslar/${form.course_slug}`
    : "https://thorius.com.tr/kurslar/...";

  function update<K extends keyof CourseBasicsInput>(
    key: K,
    value: CourseBasicsInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function applySeoDefaults() {
    const defaults = buildCourseSeoDefaults({
      title: form.title,
      subtitle: form.subtitle,
      description_md: form.description_md,
      category: form.category,
    });
    setForm((current) => ({
      ...current,
      seo_title: defaults.seo_title,
      seo_description: defaults.seo_description,
      seo_focus_keyword: defaults.seo_focus_keyword,
    }));
    toast.success("SEO alanları güncellendi");
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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-[#0B1E3F]/10 bg-gradient-to-br from-[#0B1E3F] via-[#12284f] to-[#0B1E3F] p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
              Kurs Oluşturucu
            </p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
              {form.title.trim() || "Yeni Kurs Taslağı"}
            </h1>
            <p className="mt-2 text-sm text-white/75">
              Temel bilgiler, vitrin açıklaması ve SEO alanları WordPress ve
              WooCommerce ile senkronize edilir.
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              form.published
                ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                : "bg-white/10 text-white/90 ring-1 ring-white/20"
            }`}
          >
            {form.published ? "Yayında" : "Taslak"}
          </span>
        </div>
      </div>

      <CourseBuilderNav courseId={course.id} current="basics" />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <CourseBuilderSection
            title="Kurs Kimliği"
            description="Başlık, URL ve kategori vitrinde görünür."
            icon={BookOpen}
          >
            <div className="space-y-2">
              <Label htmlFor="title">Kurs Başlığı</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="h-11 border-primary-200"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="course_slug">Kurs URL Adresi</Label>
                <button
                  type="button"
                  className="text-xs font-medium text-[#D4AF37] hover:underline"
                  onClick={() =>
                    update("course_slug", slugifyCourseTitle(form.title))
                  }
                >
                  Başlıktan oluştur
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-600">
                  /kurslar/
                </span>
                <Input
                  id="course_slug"
                  value={form.course_slug ?? ""}
                  onChange={(e) =>
                    update(
                      "course_slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9-]+/g, "-")
                        .replace(/^-+|-+$/g, ""),
                    )
                  }
                  placeholder="ornek-kurs-adi"
                  className="h-11 border-primary-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Alt Başlık</Label>
              <Input
                id="subtitle"
                value={form.subtitle ?? ""}
                onChange={(e) => update("subtitle", e.target.value)}
                placeholder="Kısa vitrin cümlesi (SEO özeti için ideal)"
                className="h-11 border-primary-200"
              />
              <p className="text-xs text-primary-500">
                WordPress özet alanı ve kısa ürün açıklaması olarak kullanılır.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <select
                id="category"
                value={form.category ?? ""}
                onChange={(e) => update("category", e.target.value)}
                className="h-11 w-full rounded-md border border-primary-200 px-3 text-sm"
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </CourseBuilderSection>

          <CourseBuilderSection
            title="Kurs Açıklaması"
            description="Markdown destekli uzun açıklama WordPress içeriğine HTML olarak gider."
            icon={FileText}
          >
            <div data-color-mode="light" className="overflow-hidden rounded-xl border border-primary-100">
              <MarkdownEditor
                value={form.description_md ?? ""}
                onChange={(value) => update("description_md", value ?? "")}
                height={280}
              />
            </div>
          </CourseBuilderSection>

          <CourseBuilderSection
            title="English Content (optional)"
            description="Shown on academy.thorius.com.tr/en when filled. Turkish fields remain the primary source."
            icon={FileText}
          >
            <div className="space-y-2">
              <Label htmlFor="title_en">Course Title (EN)</Label>
              <Input
                id="title_en"
                value={form.title_en ?? ""}
                onChange={(e) => update("title_en", e.target.value)}
                className="h-11 border-primary-200"
                placeholder="English course title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle_en">Subtitle (EN)</Label>
              <Input
                id="subtitle_en"
                value={form.subtitle_en ?? ""}
                onChange={(e) => update("subtitle_en", e.target.value)}
                className="h-11 border-primary-200"
                placeholder="Short catalog excerpt in English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_md_en">Description (EN)</Label>
              <div
                data-color-mode="light"
                className="overflow-hidden rounded-xl border border-primary-100"
              >
                <MarkdownEditor
                  value={form.description_md_en ?? ""}
                  onChange={(value) => update("description_md_en", value ?? "")}
                  height={220}
                />
              </div>
            </div>
          </CourseBuilderSection>

          <CourseBuilderSection
            title="SEO ve Arama Görünürlüğü"
            description="Rank Math alanları WordPress kursu ve WooCommerce ürününe yazılır."
            icon={Search}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-primary-600">
                Google ve site içi arama için optimize edin.
              </p>
              <button
                type="button"
                onClick={applySeoDefaults}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold text-[#0B1E3F] hover:bg-[#D4AF37]/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Otomatik doldur
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_title">SEO Başlığı</Label>
                <span className="text-xs text-primary-500">
                  {countLabel(form.seo_title, 60)}
                </span>
              </div>
              <Input
                id="seo_title"
                value={form.seo_title ?? ""}
                onChange={(e) => update("seo_title", e.target.value.slice(0, 60))}
                className="h-11 border-primary-200"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="seo_description">Meta Açıklama</Label>
                <span className="text-xs text-primary-500">
                  {countLabel(form.seo_description, 160)}
                </span>
              </div>
              <textarea
                id="seo_description"
                value={form.seo_description ?? ""}
                onChange={(e) =>
                  update("seo_description", e.target.value.slice(0, 160))
                }
                rows={4}
                className="w-full rounded-md border border-primary-200 px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seo_focus_keyword">Odak Anahtar Kelime</Label>
              <Input
                id="seo_focus_keyword"
                value={form.seo_focus_keyword ?? ""}
                onChange={(e) => update("seo_focus_keyword", e.target.value)}
                placeholder="ör. perakende planlama, stok yönetimi"
                className="h-11 border-primary-200"
              />
            </div>
          </CourseBuilderSection>

          <CourseBuilderSection
            title="Medya"
            description="Kapak görseli vitrin, WC ürünü ve sosyal paylaşımlarda kullanılır."
            icon={ImageIcon}
          >
            <ImageUploadField
              label="Kapak Görseli"
              value={form.cover_image_url ?? null}
              onChange={(url) => update("cover_image_url", url ?? "")}
              onUpload={(uploadFormData) =>
                uploadCourseCoverImage(course.id, uploadFormData)
              }
              disabled={isPending}
              previewAlt="Kapak önizleme"
            />

            <div className="space-y-2">
              <Label htmlFor="intro" className="inline-flex items-center gap-2">
                <Video className="h-4 w-4 text-primary-500" />
                Tanıtım Videosu URL
              </Label>
              <Input
                id="intro"
                value={form.intro_video_url ?? ""}
                onChange={(e) => update("intro_video_url", e.target.value)}
                placeholder="YouTube, Vimeo veya Bunny CDN URL"
                className="h-11 border-primary-200"
              />
            </div>
          </CourseBuilderSection>

          <CourseBuilderSection
            title="Fiyatlandırma"
            description="Ücretli kurslar WooCommerce ürünü olarak satılır."
            icon={Tag}
          >
            <div className="flex flex-wrap gap-3">
              {(["free", "paid"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => update("pricing_model", option)}
                  className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                    form.pricing_model === option
                      ? "bg-[#0B1E3F] text-[#D4AF37] shadow-sm"
                      : "border border-primary-200 text-[#0B1E3F] hover:border-[#D4AF37]"
                  }`}
                >
                  {option === "free" ? "Ücretsiz" : "Ücretli"}
                </button>
              ))}
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
                    className="h-11 border-primary-200"
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
                    className="h-11 border-primary-200"
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
                  className="h-11 w-full rounded-md border border-primary-200 px-3 text-sm"
                >
                  <option>Başlangıç</option>
                  <option>Orta</option>
                  <option>İleri</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Kurs dili</Label>
                <select
                  id="language"
                  value={form.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="h-11 w-full rounded-md border border-primary-200 px-3 text-sm"
                >
                  <option>Türkçe</option>
                  <option>İngilizce</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle_language">Altyazı dili</Label>
              <select
                id="subtitle_language"
                value={form.subtitle_language ?? "Yok"}
                onChange={(e) =>
                  update(
                    "subtitle_language",
                    e.target.value === "Yok" ? null : e.target.value,
                  )
                }
                className="h-11 w-full rounded-md border border-primary-200 px-3 text-sm"
              >
                <option value="Yok">Yok</option>
                <option value="Türkçe">Türkçe</option>
                <option value="İngilizce">İngilizce</option>
              </select>
              <p className="text-xs text-muted-foreground">
                Ders videolarında altyazı varsa buradan belirtin.
              </p>
            </div>
          </CourseBuilderSection>
        </div>

        <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
          <CourseSeoPreview
            title={form.seo_title ?? form.title}
            description={form.seo_description ?? form.subtitle ?? ""}
            url={previewUrl}
          />

          <div className="rounded-2xl border border-primary-100 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-[#0B1E3F]">Yayın Ayarları</h3>
            <div className="mt-4 space-y-3">
              <label className="flex items-center justify-between rounded-xl border border-primary-100 px-4 py-3">
                <span className="text-sm font-medium text-[#0B1E3F]">
                  {form.visibility === "public" ? "Herkese Açık" : "Gizli"}
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

            {form.published ? (
              <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                Yayın için başlık, URL, kategori, açıklama, kapak görseli ve
                müfredatta en az bir bölüm + ders gerekir.
              </p>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-primary-600">
                Taslak modunda WordPress senkronu isteğe bağlıdır; yayında zorunludur.
              </p>
            )}

            <div className="mt-5 space-y-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleSave()}
                className="w-full rounded-xl bg-[#0B1E3F] px-4 py-2.5 text-sm font-semibold text-[#D4AF37] hover:bg-[#0B1E3F]/90 disabled:opacity-60"
              >
                {isPending ? "Kaydediliyor…" : "Kaydet"}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  handleSave(`/instructor/courses/${course.id}/curriculum`)
                }
                className="w-full rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-semibold text-[#0B1E3F] hover:bg-[#D4AF37]/90 disabled:opacity-60"
              >
                Kaydet ve İlerle →
              </button>
            </div>
          </div>
        </aside>
      </div>

      <StepNavButtons
        nextHref={`/instructor/courses/${course.id}/curriculum`}
        nextLabel="Müfredata Geç →"
        showUpdate
        isPending={isPending}
        onUpdate={() => handleSave()}
      />
    </div>
  );
}
