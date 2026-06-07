import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Settings2 } from "lucide-react";
import { isCareerPathAdmin } from "@/lib/career-path/admin-access";
import {
  getCareerPathAdminDiagnostics,
  getSupabaseUrlForDisplay,
} from "@/lib/career-path/admin-diagnostics";
import { getCareerPathDbStatus } from "@/lib/career-path/db-status";
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

  const [paths, dbStatus, diagnostics] = await Promise.all([
    listCareerPathsFromDb({ includeUnpublished: true }),
    getCareerPathDbStatus(),
    getCareerPathAdminDiagnostics(),
  ]);
  const usingStaticFallback = paths.some((path) => path.id.startsWith("static-"));
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

      {usingStaticFallback ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          {!dbStatus.hasCareerPathsTable ? (
            <p>
              <strong>Veritabanı tablosu bulunamadı.</strong> Supabase SQL
              Editor&apos;da migration dosyasını çalıştırın:{" "}
              <code className="rounded bg-amber-100 px-1">
                supabase/migrations/20260529120000_career_paths.sql
              </code>
            </p>
          ) : !dbStatus.hasServiceRole ? (
            <p>
              <strong>Supabase service role anahtarı eksik.</strong> Vercel
              ortam değişkenlerine{" "}
              <code className="rounded bg-amber-100 px-1">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              ekleyin (Supabase → Project Settings → API → service_role secret),
              ardından siteyi yeniden deploy edin.
            </p>
          ) : (
            <p>
              <strong>DB bağlantısı doğrulanamadı.</strong> Sayfayı yenileyin;
              sorun sürerse Supabase ve Vercel env ayarlarını kontrol edin.
            </p>
          )}
        </div>
      ) : !dbStatus.hasServiceRole ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>Kayıt ve silme için service role gerekli.</strong> Vercel&apos;e{" "}
          <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code>{" "}
          ekleyip redeploy edin; aksi halde düzenleme kaydedilemez.
        </div>
      ) : null}

      {pathsWithStepCount.length === 0 ? (
        <div className="mb-6 space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950">
          <p className="font-semibold">
            Liste boş — site Supabase&apos;den veri okuyamıyor.
          </p>
          <div className="rounded-lg bg-amber-100/80 p-3 text-xs">
            <p>
              <strong>Site URL:</strong>{" "}
              {getSupabaseUrlForDisplay() ?? "NEXT_PUBLIC_SUPABASE_URL eksik"}
            </p>
            <p>
              <strong>Proje ref:</strong>{" "}
              {diagnostics.projectRef ?? "bulunamadı"} (Supabase&apos;de{" "}
              <strong>vgpvnzszdvyxucyxucdy</strong> olmalı)
            </p>
            <p>
              <strong>Publishable key:</strong>{" "}
              {diagnostics.hasPublishableKey
                ? diagnostics.publishableKeyKind
                : "eksik"}
            </p>
            <p>
              <strong>Service role key:</strong>{" "}
              {diagnostics.hasServiceRole
                ? diagnostics.serviceRoleKeyKind
                : "eksik"}
            </p>
            <p>
              <strong>Session ile okunan kayıt:</strong>{" "}
              {diagnostics.sessionCount ?? "okunamadı"}
            </p>
            {diagnostics.sessionError ? (
              <p className="text-red-800">
                <strong>Session hatası:</strong> {diagnostics.sessionError}
              </p>
            ) : null}
            <p>
              <strong>Service role ile okunan kayıt:</strong>{" "}
              {diagnostics.adminCount ?? "okunamadı"}
            </p>
            {diagnostics.adminError ? (
              <p className="text-red-800">
                <strong>Service role hatası:</strong> {diagnostics.adminError}
              </p>
            ) : null}
          </div>
          {diagnostics.sessionError?.toLowerCase().includes("schema cache") ||
          diagnostics.adminError?.toLowerCase().includes("schema cache") ? (
            <p>
              <strong>Çözüm:</strong> Supabase SQL Editor&apos;da şunu çalıştırın:{" "}
              <code className="rounded bg-amber-100 px-1">
                NOTIFY pgrst, &apos;reload schema&apos;;
              </code>{" "}
              Sonra 30 sn bekleyip sayfayı yenileyin.
            </p>
          ) : null}
          {diagnostics.sessionCount === 3 || diagnostics.adminCount === 3 ? (
            <p>Sunucu veriyi görüyor; sayfayı Ctrl+F5 ile yenileyin.</p>
          ) : !diagnostics.hasPublishableKey ? (
            <p>
              Vercel&apos;e{" "}
              <code className="rounded bg-amber-100 px-1">
                NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
              </code>{" "}
              ekleyin (Supabase API Keys → anon public). Üç env aynı projeden
              olmalı: URL, anon key, service_role key.
            </p>
          ) : !diagnostics.hasServiceRole ? (
            <p>
              Vercel&apos;e{" "}
              <code className="rounded bg-amber-100 px-1">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              ekleyip redeploy edin.
            </p>
          ) : diagnostics.projectRef !== "vgpvnzszdvyxucyxucdy" ? (
            <p>
              Vercel yanlış Supabase projesine bağlı. Tüm anahtarları{" "}
              <strong>vgpvnzszdvyxucyxucdy</strong> projesinden alın.
            </p>
          ) : diagnostics.publishableKeyKind.includes("YANLIŞ") ||
            diagnostics.serviceRoleKeyKind.includes("YANLIŞ") ? (
            <p>
              <strong>Anahtarlar karışmış.</strong> Vercel&apos;de: publishable
              = Publishable veya legacy anon; service role ={" "}
              <strong>Legacy service_role secret</strong> (yeni Secret değil).
            </p>
          ) : (
            <p>
              Supabase SQL Editor&apos;da{" "}
              <code className="rounded bg-amber-100 px-1">
                NOTIFY pgrst, &apos;reload schema&apos;;
              </code>{" "}
              çalıştırın. Vercel env değişkenlerinde{" "}
              <strong>Production</strong> işaretli olduğundan emin olun, sonra
              redeploy edin.
            </p>
          )}
        </div>
      ) : null}

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
            {pathsWithStepCount.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  Henüz kariyer yolu yok veya veritabanı bağlantısı kurulamadı.
                </td>
              </tr>
            ) : null}
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
