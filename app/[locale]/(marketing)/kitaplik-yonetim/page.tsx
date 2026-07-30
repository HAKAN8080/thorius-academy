import type { Metadata } from "next";
import { Shield } from "lucide-react";
import { KitaplikAdminShell } from "@/components/kitaplik/kitaplik-admin-shell";
import { Container } from "@/components/layout/container";
import { listAllLibraryBooksForAdmin } from "@/lib/kitaplik/admin-repository";
import { listKitaplikAdminUsers } from "@/lib/kitaplik/admin-users";
import { requireKitaplikAdmin } from "@/lib/kitaplik/require-kitaplik-admin";

export const metadata: Metadata = {
  title: "Admin Panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KitaplikYonetimPage() {
  await requireKitaplikAdmin();

  const books = await listAllLibraryBooksForAdmin();
  let users: Awaited<ReturnType<typeof listKitaplikAdminUsers>> = [];
  let usersError: string | null = null;

  try {
    users = await listKitaplikAdminUsers();
  } catch (error) {
    usersError =
      error instanceof Error ? error.message : "Kullanicilar yuklenemedi.";
  }

  return (
    <Container className="py-10 md:py-14">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-primary-950 p-2">
            <Shield className="h-6 w-6 text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-950 md:text-3xl">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Kitap katalogu yonetimi ve kayitli kullanici / e-kitap haklari.
            </p>
          </div>
        </div>
      </header>

      {usersError ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Kullanici listesi yuklenemedi: {usersError}
        </p>
      ) : null}

      <KitaplikAdminShell initialBooks={books} initialUsers={users} />
    </Container>
  );
}
