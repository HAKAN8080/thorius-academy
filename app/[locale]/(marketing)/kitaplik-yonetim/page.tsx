import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { KitaplikBookAdminPanel } from "@/components/kitaplik/kitaplik-book-admin-panel";
import { Container } from "@/components/layout/container";
import { listAllLibraryBooksForAdmin } from "@/lib/kitaplik/admin-repository";
import { requireKitaplikAdmin } from "@/lib/kitaplik/require-kitaplik-admin";

export const metadata: Metadata = {
  title: "Kitap Yukleme",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function KitaplikYonetimPage() {
  await requireKitaplikAdmin();
  const books = await listAllLibraryBooksForAdmin();

  return (
    <Container className="py-10 md:py-14">
      <header className="mb-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="rounded-lg bg-primary-950 p-2">
            <BookOpen className="h-6 w-6 text-accent-400" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-950 md:text-3xl">
              Kitaplik Yonetimi
            </h1>
            <p className="text-muted-foreground">
              Yeni kitap ekleyin, WooCommerce urun ID&apos;lerini baglayin ve e-kitap
              PDF&apos;ini yukleyin.
            </p>
          </div>
        </div>
      </header>

      <KitaplikBookAdminPanel initialBooks={books} />
    </Container>
  );
}
