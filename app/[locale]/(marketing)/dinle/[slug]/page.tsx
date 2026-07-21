import { notFound, redirect } from "next/navigation";
import { AudiobookReader } from "@/components/kitaplik/audiobook-reader";
import {
  getAudiobookChapterSources,
  getAudiobookManifest,
} from "@/lib/kitaplik/audiobook-access";
import { getKitaplikBookPurchaseState } from "@/lib/kitaplik/book-purchase-state";
import { academyPath, kitaplikPath } from "@/lib/site/site-mode";
import { createClient } from "@/lib/supabase/server";

interface DinlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: DinlePageProps) {
  const { slug } = await params;
  const { book } = await getKitaplikBookPurchaseState(slug);
  return {
    title: book ? `${book.title} — Sesli Dinle` : "Sesli e-kitap",
  };
}

export default async function DinlePage({ params }: DinlePageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      academyPath(
        `/giris?redirect=${encodeURIComponent(kitaplikPath(`/dinle/${slug}`))}`,
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

  const manifest = await getAudiobookManifest(slug);
  if (!manifest) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1228] px-6 text-center text-white">
        <p>Bu kitabın sesli sürümü henüz hazır değil.</p>
      </div>
    );
  }

  const chapters = await getAudiobookChapterSources(manifest);

  return (
    <AudiobookReader
      slug={slug}
      title={book.title}
      coverImageUrl={book.cover_image_url}
      chapters={chapters}
    />
  );
}
