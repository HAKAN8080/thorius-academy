"use client";

import { useMemo, useState, useTransition } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, ExternalLink, Languages } from "lucide-react";
import { toast } from "sonner";
import { saveAdminCatalogCourseContent } from "@/lib/actions/catalog-admin";
import type {
  AdminCatalogCourseContent,
  AdminCatalogCourseContentInput,
} from "@/lib/course/catalog-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import "@uiw/react-md-editor/markdown-editor.css";

const MarkdownEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false },
);

interface AdminCourseContentEditorProps {
  initialContent: AdminCatalogCourseContent;
}

type FormState = AdminCatalogCourseContentInput & {
  sections: Array<{ id: string; title: string; titleEn?: string | null }>;
  lessons: Array<{ id: string; title: string; titleEn?: string | null }>;
};

function toFormState(content: AdminCatalogCourseContent): FormState {
  return {
    title: content.title,
    subtitle: content.subtitle,
    descriptionMd: content.descriptionMd,
    titleEn: content.titleEn,
    subtitleEn: content.subtitleEn,
    descriptionMdEn: content.descriptionMdEn,
    whatWillLearn: content.whatWillLearn,
    targetAudience: content.targetAudience,
    whatWillLearnEn: content.whatWillLearnEn,
    targetAudienceEn: content.targetAudienceEn,
    language: content.language,
    subtitleLanguage: content.subtitleLanguage,
    sections: content.sections.map((section) => ({
      id: section.id,
      title: section.title,
      titleEn: section.titleEn,
    })),
    lessons: content.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      titleEn: lesson.titleEn,
    })),
  };
}

function hasEnglishContent(form: FormState): boolean {
  return Boolean(
    form.titleEn?.trim() ||
      form.subtitleEn?.trim() ||
      form.descriptionMdEn?.trim() ||
      form.whatWillLearnEn?.trim() ||
      form.targetAudienceEn?.trim(),
  );
}

export function AdminCourseContentEditor({
  initialContent,
}: AdminCourseContentEditorProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(initialContent));
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(initialContent.sections.map((section) => section.id)),
  );
  const [curriculumFilter, setCurriculumFilter] = useState("");
  const [isPending, startTransition] = useTransition();

  const lessonsBySection = useMemo(() => {
    const map = new Map<string, typeof initialContent.lessons>();
    for (const lesson of initialContent.lessons) {
      const key = lesson.sectionId ?? "none";
      const bucket = map.get(key) ?? [];
      bucket.push(lesson);
      map.set(key, bucket);
    }
    return map;
  }, [initialContent.lessons]);

  const filteredSectionIds = useMemo(() => {
    const query = curriculumFilter.trim().toLowerCase();
    if (!query) return null;

    const matches = new Set<string>();
    for (const section of form.sections) {
      const sectionLessons = lessonsBySection.get(section.id) ?? [];
      const sectionHit =
        section.title.toLowerCase().includes(query) ||
        (section.titleEn ?? "").toLowerCase().includes(query);
      const lessonHit = sectionLessons.some((lesson) => {
        const lessonForm = form.lessons.find((item) => item.id === lesson.id);
        return (
          lesson.title.toLowerCase().includes(query) ||
          (lessonForm?.titleEn ?? "").toLowerCase().includes(query) ||
          (lessonForm?.title ?? "").toLowerCase().includes(query)
        );
      });
      if (sectionHit || lessonHit) {
        matches.add(section.id);
      }
    }
    return matches;
  }, [curriculumFilter, form.lessons, form.sections, lessonsBySection]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateSection(
    sectionId: string,
    patch: Partial<{ title: string; titleEn: string | null }>,
  ) {
    setForm((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section,
      ),
    }));
  }

  function updateLesson(
    lessonId: string,
    patch: Partial<{ title: string; titleEn: string | null }>,
  ) {
    setForm((current) => ({
      ...current,
      lessons: current.lessons.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, ...patch } : lesson,
      ),
    }));
  }

  function toggleSection(sectionId: string) {
    setExpandedSections((current) => {
      const next = new Set(current);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const result = await saveAdminCatalogCourseContent(initialContent.id, form);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      setForm(toFormState(result.content));
      toast.success("İçerik kaydedildi ✓");
      router.refresh();
    });
  }

  const englishReady = hasEnglishContent(form);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-primary-100 bg-white p-5">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={englishReady ? "default" : "secondary"}>
              {englishReady ? "EN içerik var" : "EN içerik eksik"}
            </Badge>
            <Badge variant="outline">{form.language ?? "Türkçe"}</Badge>
            {form.subtitleLanguage ? (
              <Badge variant="outline">Altyazı: {form.subtitleLanguage}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{initialContent.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/kurslar/${initialContent.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              TR önizleme
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/en/kurslar/${initialContent.slug}`} target="_blank">
              <ExternalLink className="mr-1.5 h-4 w-4" />
              EN önizleme
            </Link>
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Kaydediliyor…" : "Kaydet"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="language">Kurs dili</Label>
          <select
            id="language"
            value={form.language ?? "Türkçe"}
            onChange={(event) => updateField("language", event.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="Türkçe">Türkçe</option>
            <option value="İngilizce">İngilizce</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle_language">Altyazı dili</Label>
          <select
            id="subtitle_language"
            value={form.subtitleLanguage ?? "Yok"}
            onChange={(event) =>
              updateField(
                "subtitleLanguage",
                event.target.value === "Yok" ? null : event.target.value,
              )
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="Yok">Yok</option>
            <option value="Türkçe">Türkçe</option>
            <option value="İngilizce">İngilizce</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-white p-5">
        <div className="mb-5 flex items-center gap-2">
          <Languages className="h-5 w-5 text-primary-700" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-primary-950">Kurs metinleri</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4 rounded-xl border border-primary-100 bg-primary-50/30 p-4">
            <p className="text-sm font-semibold text-primary-900">Türkçe</p>
            <div className="space-y-2">
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Alt başlık</Label>
              <Input
                id="subtitle"
                value={form.subtitle ?? ""}
                onChange={(event) => updateField("subtitle", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_md">Açıklama</Label>
              <div data-color-mode="light" className="overflow-hidden rounded-xl border">
                <MarkdownEditor
                  value={form.descriptionMd ?? ""}
                  onChange={(value) => updateField("descriptionMd", value ?? "")}
                  height={220}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_will_learn">Neler öğreneceksiniz</Label>
              <textarea
                id="what_will_learn"
                rows={5}
                value={form.whatWillLearn ?? ""}
                onChange={(event) => updateField("whatWillLearn", event.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_audience">Hedef kitle</Label>
              <textarea
                id="target_audience"
                rows={5}
                value={form.targetAudience ?? ""}
                onChange={(event) => updateField("targetAudience", event.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-dashed border-primary-200 bg-white p-4">
            <p className="text-sm font-semibold text-primary-900">English</p>
            <div className="space-y-2">
              <Label htmlFor="title_en">Title</Label>
              <Input
                id="title_en"
                value={form.titleEn ?? ""}
                onChange={(event) => updateField("titleEn", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle_en">Subtitle</Label>
              <Input
                id="subtitle_en"
                value={form.subtitleEn ?? ""}
                onChange={(event) => updateField("subtitleEn", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description_md_en">Description</Label>
              <div data-color-mode="light" className="overflow-hidden rounded-xl border">
                <MarkdownEditor
                  value={form.descriptionMdEn ?? ""}
                  onChange={(value) => updateField("descriptionMdEn", value ?? "")}
                  height={220}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="what_will_learn_en">What you will learn</Label>
              <textarea
                id="what_will_learn_en"
                rows={5}
                value={form.whatWillLearnEn ?? ""}
                onChange={(event) => updateField("whatWillLearnEn", event.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target_audience_en">Target audience</Label>
              <textarea
                id="target_audience_en"
                rows={5}
                value={form.targetAudienceEn ?? ""}
                onChange={(event) => updateField("targetAudienceEn", event.target.value)}
                className="w-full rounded-md border border-input px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-primary-100 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-primary-950">Müfredat (TR / EN)</h2>
            <p className="text-sm text-muted-foreground">
              {form.sections.length} bölüm · {form.lessons.length} ders
            </p>
          </div>
          <Input
            value={curriculumFilter}
            onChange={(event) => setCurriculumFilter(event.target.value)}
            placeholder="Bölüm veya ders ara…"
            className="max-w-xs"
          />
        </div>

        <div className="space-y-3">
          {form.sections.map((section) => {
            if (filteredSectionIds && !filteredSectionIds.has(section.id)) {
              return null;
            }

            const sectionLessons = (lessonsBySection.get(section.id) ?? []).map(
              (lesson) => form.lessons.find((item) => item.id === lesson.id)!,
            );
            const expanded = expandedSections.has(section.id);

            return (
              <div
                key={section.id}
                className="overflow-hidden rounded-xl border border-primary-100"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-center gap-2 bg-primary-50/50 px-4 py-3 text-left"
                >
                  {expanded ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                  <span className="font-medium text-primary-950">
                    {section.title || "Bölüm"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {sectionLessons.length} ders
                  </span>
                </button>

                {expanded ? (
                  <div className="space-y-4 px-4 py-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label>Bölüm başlığı (TR)</Label>
                        <Input
                          value={section.title}
                          onChange={(event) =>
                            updateSection(section.id, { title: event.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label>Section title (EN)</Label>
                        <Input
                          value={section.titleEn ?? ""}
                          onChange={(event) =>
                            updateSection(section.id, { titleEn: event.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      {sectionLessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="grid gap-2 rounded-lg border border-primary-50 bg-primary-50/20 p-3 md:grid-cols-2"
                        >
                          <Input
                            value={lesson.title}
                            onChange={(event) =>
                              updateLesson(lesson.id, { title: event.target.value })
                            }
                            aria-label={`${lesson.title} TR`}
                          />
                          <Input
                            value={lesson.titleEn ?? ""}
                            onChange={(event) =>
                              updateLesson(lesson.id, { titleEn: event.target.value })
                            }
                            placeholder="English title"
                            aria-label={`${lesson.title} EN`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="button" onClick={handleSave} disabled={isPending}>
          {isPending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
      </div>
    </div>
  );
}
