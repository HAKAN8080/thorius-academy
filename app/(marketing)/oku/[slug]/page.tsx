import { notFound, redirect } from "next/navigation";
import { EbookReader } from "@/components/kitaplik/ebook-reader";
import {
  getKitaplikBookPurchaseState,
} from "@/lib/kitaplik/book-purchase-state";
import { academyPath, kitaplikPath } from "@/lib/site/site-mode";
import { createClient } from "@/lib/supabase/server";

interface OkuPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: OkuPageProps) {
  const { slug } = await params;
  const { book } = await getKitaplikBookPurchaseState(slug);
  return {
    title: book ? `${book.title} — Oku` : "E-kitap okuyucu",
  };
}

export default async function OkuPage({ params }: OkuPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      academyPath(
        `/giris?redirect=${encodeURIComponent(kitaplikPath(`/oku/${slug}`))}`,
      ),
    );
  }

  const { book, hasEbookAccess } = await getKitaplikBookPurchaseState(slug);

  if (!book) {
    notFound();
  }

  if (!hasEbookAccess) {
    redirect(`/kitap/${slug}`);
  }

  if (!book.ebook_storage_path) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1228] px-6 text-center text-white">
        <p>E-kitap dosyası henüz yüklenmedi. Lütfen daha sonra tekrar deneyin.</p>
      </div>
    );
  }

  const watermark = user.email ?? user.id;

  return <EbookReader slug={slug} title={book.title} watermark={watermark} />;
}
