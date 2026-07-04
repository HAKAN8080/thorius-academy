"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { bulkToggleAdminCatalogCoursesPublished, toggleAdminCatalogCoursePublished, updateAdminCatalogCourseInstructor } from "@/lib/actions/catalog-admin";
import type {
  AdminCatalogCourse,
  AdminCatalogInstructor,
  CatalogPublishedFilter,
} from "@/lib/course/catalog-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminCourseCatalogPanelProps {
  courses: AdminCatalogCourse[];
  categories: string[];
  instructors: AdminCatalogInstructor[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  category: string;
  published: CatalogPublishedFilter;
}

export function AdminCourseCatalogPanel({
  courses,
  categories,
  instructors,
  total,
  page,
  totalPages,
  search,
  category,
  published,
}: AdminCourseCatalogPanelProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [pendingAuthorId, setPendingAuthorId] = useState<string | null>(null);
  const [isBulkPending, startBulk] = useTransition();

  const summary = useMemo(() => {
    const publishedCount = courses.filter((course) => course.published).length;
    return `${total} kurs · bu sayfada ${publishedCount}/${courses.length} yayında`;
  }, [courses, total]);

  function buildUrl(next: {
    search?: string;
    category?: string;
    published?: CatalogPublishedFilter;
    page?: number;
  }) {
    const params = new URLSearchParams();
    const nextSearch = next.search ?? search;
    const nextCategory = next.category ?? category;
    const nextPublished = next.published ?? published;
    const nextPage = next.page ?? page;

    if (nextSearch.trim()) params.set("q", nextSearch.trim());
    if (nextCategory.trim()) params.set("category", nextCategory.trim());
    if (nextPublished !== "all") params.set("status", nextPublished);
    if (nextPage > 1) params.set("page", String(nextPage));

    const query = params.toString();
    return query ? `/panel/yonetim/kurslar?${query}` : "/panel/yonetim/kurslar";
  }

  async function handleToggle(course: AdminCatalogCourse) {
    const nextPublished = !course.published;
    setPendingId(course.id);

    const result = await toggleAdminCatalogCoursePublished(course.id, nextPublished);
    setPendingId(null);

    if ("error" in result) {
      toast.error(result.error);
      return;
    }

    toast.success(
      nextPublished ? `"${course.title}" yayına alındı.` : `"${course.title}" yayından kaldırıldı.`,
    );
    router.refresh();
  }

  function instructorLabel(instructor: AdminCatalogInstructor): string {
    if (instructor.fullName && instructor.email) {
      return `${instructor.fullName} (${instructor.email})`;
    }
    return instructor.fullName || instructor.email || `WP #${instructor.wpUserId}`;
  }

  async function handleAuthorChange(course: AdminCatalogCourse, nextInstructorWpUserId: number) {
    if (!nextInstructorWpUserId || nextInstructorWpUserId === course.instructorWpUserId) {
      return;
    }

    const nextInstructor = instructors.find(
      (instructor) => instructor.wpUserId === nextInstructorWpUserId,
    );
    if (!nextInstructor) {
      toast.error("Seçilen yazar bulunamadı.");
      return;
    }

    const confirmed = window.confirm(
      `"${course.title}" kursunun yazarını "${instructorLabel(nextInstructor)}" olarak değiştirmek istiyor musunuz?`,
    );
    if (!confirmed) {
      router.refresh();
      return;
    }

    setPendingAuthorId(course.id);
    const result = await updateAdminCatalogCourseInstructor(
      course.id,
      nextInstructorWpUserId,
    );
    setPendingAuthorId(null);

    if ("error" in result) {
      toast.error(result.error);
      router.refresh();
      return;
    }

    if (result.wpWarning) {
      toast.warning(`Yazar güncellendi; WordPress: ${result.wpWarning}`);
    } else {
      toast.success(`"${course.title}" yazarı güncellendi.`);
    }
    router.refresh();
  }

  function handleBulkToggle(nextPublished: boolean) {
    const actionLabel = nextPublished ? "yayına almak" : "yayından kaldırmak";
    const confirmed = window.confirm(
      `Mevcut filtreyle eşleşen tüm kursları (${total} adet) ${actionLabel} istediğinize emin misiniz?`,
    );
    if (!confirmed) return;

    startBulk(async () => {
      const result = await bulkToggleAdminCatalogCoursesPublished({
        search,
        category,
        published,
        nextPublished,
      });

      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      toast.success(
        nextPublished
          ? `${result.updated} kurs yayına alındı.`
          : `${result.updated} kurs yayından kaldırıldı.`,
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <form
        method="get"
        action="/panel/yonetim/kurslar"
        className="grid gap-3 rounded-2xl border border-primary-100 bg-white p-4 md:grid-cols-[1fr_220px_180px_auto]"
      >
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            name="q"
            defaultValue={search}
            placeholder="Kurs adı veya slug ara…"
            className="pl-9"
          />
        </div>

        <select
          name="category"
          defaultValue={category}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Tüm kategoriler</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          name="status"
          defaultValue={published}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">Tüm durumlar</option>
          <option value="published">Yayında</option>
          <option value="unpublished">Yayından kaldırılmış</option>
        </select>

        <Button type="submit">Filtrele</Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{summary}</p>
        {total > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending || pendingId !== null}
              onClick={() => handleBulkToggle(false)}
            >
              Filtredekileri yayından kaldır ({total})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending || pendingId !== null}
              onClick={() => handleBulkToggle(true)}
            >
              Filtredekileri yayına al ({total})
            </Button>
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-primary-100 bg-primary-50/60 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold text-primary-950">Kurs</th>
                <th className="px-4 py-3 font-semibold text-primary-950">Kategori</th>
                <th className="px-4 py-3 font-semibold text-primary-950">Yazar</th>
                <th className="px-4 py-3 font-semibold text-primary-950">Durum</th>
                <th className="px-4 py-3 font-semibold text-primary-950">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-primary-50 last:border-0">
                  <td className="px-4 py-3 align-top">
                    <p className="font-medium text-primary-950">{course.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{course.slug}</p>
                  </td>
                  <td className="px-4 py-3 align-top text-primary-800">
                    {course.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="min-w-[220px] space-y-1">
                      <select
                        key={`${course.id}-${course.instructorWpUserId ?? "none"}`}
                        defaultValue={course.instructorWpUserId ?? ""}
                        disabled={
                          pendingAuthorId === course.id ||
                          pendingId === course.id ||
                          isBulkPending
                        }
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          if (!value) return;
                          void handleAuthorChange(course, value);
                        }}
                        className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                        aria-label={`${course.title} yazarı`}
                      >
                        <option value="" disabled>
                          Yazar seç…
                        </option>
                        {instructors.map((instructor) => (
                          <option key={instructor.wpUserId} value={instructor.wpUserId}>
                            {instructorLabel(instructor)}
                          </option>
                        ))}
                      </select>
                      {course.instructorEmail ? (
                        <p className="text-xs text-muted-foreground">{course.instructorEmail}</p>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <Badge variant={course.published ? "default" : "secondary"}>
                      {course.published ? "Yayında" : "Gizli"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={course.published ? "outline" : "default"}
                        disabled={pendingId === course.id}
                        onClick={() => handleToggle(course)}
                      >
                        {pendingId === course.id
                          ? "Kaydediliyor…"
                          : course.published
                            ? "Yayından kaldır"
                            : "Yayına al"}
                      </Button>
                      {course.published ? (
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/kurslar/${course.slug}`} target="_blank">
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {courses.length === 0 ? (
          <p className="px-4 py-10 text-center text-muted-foreground">
            Filtrelere uyan kurs bulunamadı.
          </p>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          {page > 1 ? (
            <Button asChild variant="outline">
              <Link href={buildUrl({ page: page - 1 })}>Önceki</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Önceki
            </Button>
          )}
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages}
          </p>
          {page < totalPages ? (
            <Button asChild variant="outline">
              <Link href={buildUrl({ page: page + 1 })}>Sonraki</Link>
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Sonraki
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
