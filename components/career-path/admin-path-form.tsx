"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import {
  deleteCareerPath,
  saveCareerPath,
} from "@/lib/actions/career-path-admin";
import type { CareerPathAdminInput } from "@/lib/career-path/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdminPathFormProps {
  pathId?: string;
  initial: CareerPathAdminInput;
}

function emptyStep(order: number) {
  return {
    stepOrder: order,
    level: `Adım ${order}`,
    label: "",
    courseSlug: "",
    fallbackTitle: "",
    description: "",
  };
}

export function AdminPathForm({ pathId, initial }: AdminPathFormProps) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function updateField<K extends keyof CareerPathAdminInput>(
    key: K,
    value: CareerPathAdminInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateStep(
    index: number,
    field: keyof CareerPathAdminInput["steps"][number],
    value: string | number,
  ) {
    setForm((current) => ({
      ...current,
      steps: current.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step,
      ),
    }));
  }

  function addStep() {
    setForm((current) => ({
      ...current,
      steps: [...current.steps, emptyStep(current.steps.length + 1)],
    }));
  }

  function removeStep(index: number) {
    setForm((current) => ({
      ...current,
      steps: current.steps
        .filter((_, stepIndex) => stepIndex !== index)
        .map((step, stepIndex) => ({
          ...step,
          stepOrder: stepIndex + 1,
          level: step.level || `Adım ${stepIndex + 1}`,
        })),
    }));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await saveCareerPath(form, pathId);
      if (!result.success) {
        setError(result.error ?? "Kayıt başarısız.");
        return;
      }

      if (!pathId && result.id) {
        router.push(`/panel/yonetim/kariyer-yollari/${result.id}`);
      } else {
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!pathId) return;
    if (!window.confirm("Bu kariyer yolunu silmek istediğinize emin misiniz?")) {
      return;
    }

    startDelete(async () => {
      const result = await deleteCareerPath(pathId);
      if (!result.success) {
        setError(result.error ?? "Silme başarısız.");
        return;
      }
      router.push("/panel/yonetim/kariyer-yollari");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="rounded-2xl border border-primary-100 bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-primary-950">Genel bilgiler</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Başlık</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(event) => updateField("slug", event.target.value)}
              placeholder="retail-planning"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subtitle">Alt başlık</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="heroEyebrow">Üst etiket</Label>
            <Input
              id="heroEyebrow"
              value={form.heroEyebrow}
              onChange={(event) =>
                updateField("heroEyebrow", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Sıra</Label>
            <Input
              id="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={(event) =>
                updateField("sortOrder", Number(event.target.value) || 0)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catalogHref">Katalog linki</Label>
            <Input
              id="catalogHref"
              value={form.catalogHref}
              onChange={(event) =>
                updateField("catalogHref", event.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catalogLabel">Katalog etiketi</Label>
            <Input
              id="catalogLabel"
              value={form.catalogLabel}
              onChange={(event) =>
                updateField("catalogLabel", event.target.value)
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="outcomes">Kazanımlar (her satır bir madde)</Label>
            <textarea
              id="outcomes"
              className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.outcomes.join("\n")}
              onChange={(event) =>
                updateField(
                  "outcomes",
                  event.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean),
                )
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="closingTitle">Kapanış başlığı</Label>
            <Input
              id="closingTitle"
              value={form.closingTitle}
              onChange={(event) =>
                updateField("closingTitle", event.target.value)
              }
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="closingDescription">Kapanış açıklaması</Label>
            <textarea
              id="closingDescription"
              className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.closingDescription}
              onChange={(event) =>
                updateField("closingDescription", event.target.value)
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-primary-900">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) =>
                updateField("isPublished", event.target.checked)
              }
              className="h-4 w-4 rounded border-primary-300"
            />
            Yayında
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-primary-100 bg-white p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-primary-950">
              Sıralı adımlar
            </h2>
            <p className="text-sm text-muted-foreground">
              Öğrenci önceki adımı tamamlamadan sonraki adıma geçemez.
            </p>
          </div>
          <Button type="button" variant="outline" onClick={addStep}>
            <Plus className="mr-2 h-4 w-4" />
            Adım ekle
          </Button>
        </div>

        <div className="space-y-4">
          {form.steps.map((step, index) => (
            <div
              key={`step-${index}`}
              className="rounded-xl border border-primary-100 bg-primary-50/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold text-primary-950">
                  Adım {index + 1}
                </p>
                {form.steps.length > 1 ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStep(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Seviye etiketi</Label>
                  <Input
                    value={step.level}
                    onChange={(event) =>
                      updateStep(index, "level", event.target.value)
                    }
                    placeholder="Başlangıç"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adım başlığı</Label>
                  <Input
                    value={step.label}
                    onChange={(event) =>
                      updateStep(index, "label", event.target.value)
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Kurs slug</Label>
                  <Input
                    value={step.courseSlug}
                    onChange={(event) =>
                      updateStep(index, "courseSlug", event.target.value)
                    }
                    placeholder="perakende-planlamaya-giris"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yedek kurs adı</Label>
                  <Input
                    value={step.fallbackTitle}
                    onChange={(event) =>
                      updateStep(index, "fallbackTitle", event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Açıklama</Label>
                  <textarea
                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={step.description}
                    onChange={(event) =>
                      updateStep(index, "description", event.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Kaydediliyor…" : pathId ? "Güncelle" : "Oluştur"}
        </Button>
        {pathId ? (
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-red-700 hover:text-red-800"
          >
            {isDeleting ? "Siliniyor…" : "Sil"}
          </Button>
        ) : null}
      </div>
    </form>
  );
}
