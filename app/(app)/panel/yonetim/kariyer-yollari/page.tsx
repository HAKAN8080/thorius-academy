import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import {
  listCareerPathStepsFromDb,
  listCareerPathsFromDb,
} from "@/lib/career-path/repository";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Kariyer Yolları Yönetimi",
};

export default async function AdminCareerPathsPage() {
  const allowed = await isCareerPathAdmin();
  if (!allowed) {
    redirect("/panel");
  }

  const paths = await listCareerPathsFromDb({ includeUnpublished: true });
  const pathsWithStepCount = await Promise.all(
    paths.map(async (path) => {
      const steps = await listCareerPathStepsFromDb(path.id, path.slug);
      return { path, stepCount: steps.length };
    }),
  );

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <div className="rounded-lg bg-primary-950 p-2">
              <Settings2 className="h-6 w-6 text-accent-400" aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-bold text-primary-950 md:text-4xl">
              Kariyer Yolları
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Sıralı öğrenme yollarını oluşturun, adımları düzenleyin ve yayınlayın.
          </p>
        </div>
        <Button asChild>
          <Link href="/panel/yonetim/kariyer-yollari/yeni">
            <Plus className="mr-2 h-4 w-4" />
            Yeni yol
          </Link>
        </Button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-primary-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary-100 bg-primary-50/50">
            <tr>
              <th className="px-4 py-3 font-semibold text-primary-950">Başlık</th>
              <th className="px-4 py-3 font-semibold text-primary-950">Slug</th>
              <th className="px-4 py-3 font-semibold text-primary-950">Adım</th>
              <th className="px-4 py-3 font-semibold text-primary-950">Durum</th>
              <th className="px-4 py-3 font-semibold text-primary-950" />
            </tr>
          </thead>
          <tbody>
            {pathsWithStepCount.map(({ path, stepCount }) => (
              <tr key={path.id} className="border-b border-primary-50 last:border-0">
                <td className="px-4 py-4 font-medium text-primary-950">
                  {path.title}
                </td>
                <td className="px-4 py-4 text-muted-foreground">{path.slug}</td>
                <td className="px-4 py-4">{stepCount}</td>
                <td className="px-4 py-4">
                  <Badge
                    className={
                      path.is_published
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-primary-100 text-primary-600"
                    }
                  >
                    {path.is_published ? "Yayında" : "Taslak"}
                  </Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  {path.id.startsWith("static-") ? (
                    <span className="text-xs text-muted-foreground">
                      DB migration gerekli
                    </span>
                  ) : (
                    <Link
                      href={`/panel/yonetim/kariyer-yollari/${path.id}`}
                      className="font-semibold text-accent-700 hover:text-accent-900"
                    >
                      Düzenle
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
