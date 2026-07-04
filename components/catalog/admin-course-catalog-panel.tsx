"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { ExternalLink, Search } from "lucide-react";
import { toast } from "sonner";
import { bulkToggleAdminCatalogCoursesPublished, toggleAdminCatalogCoursePublished } from "@/lib/actions/catalog-admin";
import type {
  AdminCatalogCourse,
  CatalogPublishedFilter,
} from "@/lib/course/catalog-admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminCourseCatalogPanelProps {
  courses: AdminCatalogCourse[];
  categories: string[];
  total: number;
  page: number;
  totalPages: number;
  search: string;
  category: string;
  published: CatalogPublishedFilter;
}

export function AdminCourseCatalogPanel({
  courses: initialCourses,
  categories,
  total,
  page,
  totalPages,
  search,
  category,
  published,
}: AdminCourseCatalogPanelProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isBulkPending, startBulk] = useTransition();
  const [isNavigating, startNavigate] = useTransition();
  const [courses, setCourses] = useState(initialCourses);

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

  function navigate(next: Parameters<typeof buildUrl>[0]) {
    startNavigate(() => {
      router.push(buildUrl(next));
    });
  }

  function handleFilterSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    navigate({
      search: String(formData.get("q") ?? ""),
      category: String(formData.get("category") ?? ""),
      published: (formData.get("status") as CatalogPublishedFilter) || "all",
      page: 1,
    });
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

    setCourses((current) =>
      current.map((item) =>
        item.id === course.id
          ? { ...item, published: result.course.published }
          : item,
      ),
    );
    toast.success(
      nextPublished ? `"${course.title}" yayına alındı.` : `"${course.title}" yayından kaldırıldı.`,
    );
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
        onSubmit={handleFilterSubmit}
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

        <Button type="submit" disabled={isNavigating}>
          {isNavigating ? "Yükleniyor…" : "Filtrele"}
        </Button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{summary}</p>
        {total > 0 ? (
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending || isNavigating}
              onClick={() => handleBulkToggle(false)}
            >
              Filtredekileri yayından kaldır ({total})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isBulkPending || isNavigating}
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
          <Button
            type="button"
            variant="outline"
            disabled={page <= 1 || isNavigating}
            onClick={() => navigate({ page: page - 1 })}
          >
            Önceki
          </Button>
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={page >= totalPages || isNavigating}
            onClick={() => navigate({ page: page + 1 })}
          >
            Sonraki
          </Button>
        </div>
      ) : null}
    </div>
  );
}
