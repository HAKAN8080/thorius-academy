import { BookOpen, Headphones, Truck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { KitaplikBookCatalog } from "@/components/kitaplik/kitaplik-book-catalog";
import { KitaplikLibraryHero } from "@/components/kitaplik/kitaplik-library-hero";
import { getEnabledAudiobookManifest } from "@/lib/kitaplik/audiobook-access";
import { listPublishedLibraryBooksWithPricing } from "@/lib/kitaplik/repository";

export async function KitaplikHomePage() {
  let books: Awaited<ReturnType<typeof listPublishedLibraryBooksWithPricing>> =
    [];
  let loadError: string | null = null;

  try {
    books = await listPublishedLibraryBooksWithPricing();
  } catch (error) {
    loadError =
      error instanceof Error ? error.message : "Kitaplar yüklenemedi.";
  }

  const audiobookFlags = await Promise.all(
    books.map(
      async (book) =>
        [book.slug, Boolean(await getEnabledAudiobookManifest(book))] as const,
    ),
  );
  const hasAudiobookBySlug = Object.fromEntries(audiobookFlags);

  return (
    <>
      <KitaplikLibraryHero />

      <section
        className="border-b border-primary-100 bg-primary-50/40 py-8 md:py-10"
        aria-label="Kitap formatları"
      >
        <Container size="wide">
          <ul className="grid gap-6 sm:grid-cols-3">
            <li className="flex gap-3">
              <Truck className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
              <div>
                <p className="font-semibold text-primary-950">Basılı</p>
                <p className="mt-1 text-sm text-primary-700">
                  Kapınıza kargo ile gönderilir.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
              <div>
                <p className="font-semibold text-primary-950">E-kitap</p>
                <p className="mt-1 text-sm text-primary-700">
                  Güvenli tarayıcı okuyucusunda.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <Headphones className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
              <div>
                <p className="font-semibold text-primary-950">Sesli</p>
                <p className="mt-1 text-sm text-primary-700">
                  Kelime kelime vurgulu dinleme.
                </p>
              </div>
            </li>
          </ul>
        </Container>
      </section>

      <section
        id="kitaplik-books"
        className="scroll-mt-24 py-10 md:py-14"
        aria-labelledby="kitaplik-books-heading"
      >
        <Container size="wide">
          <div className="mb-8">
            <h2
              id="kitaplik-books-heading"
              className="text-2xl font-bold text-primary-950"
            >
              Raftaki kitaplar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {books.length > 0 ? "Kategori ve dile göre süzün" : "Yakında yeni yayınlar"}
            </p>
          </div>

          {loadError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Kitap listesi şu an yüklenemedi.
            </p>
          ) : null}

          {books.length > 0 ? (
            <KitaplikBookCatalog
              books={books}
              hasAudiobookBySlug={hasAudiobookBySlug}
            />
          ) : (
            !loadError && (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
                <p className="text-base font-medium text-primary-900">
                  Henüz yayınlanmış kitap yok.
                </p>
              </div>
            )
          )}
        </Container>
      </section>
    </>
  );
}
