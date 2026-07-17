import Link from "next/link";
import { BookOpen, Headphones, Truck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { KitaplikBookCard } from "@/components/kitaplik/kitaplik-book-card";
import { getAudiobookManifest } from "@/lib/kitaplik/audiobook-access";
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
        [book.slug, Boolean(await getAudiobookManifest(book.slug))] as const,
    ),
  );
  const hasAudiobookBySlug = Object.fromEntries(audiobookFlags);

  return (
    <>
      <section className="relative overflow-hidden border-b border-primary-100 bg-gradient-to-br from-primary-950 via-primary-900 to-[#0a1228] py-16 text-white md:py-24">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(212,175,55,0.18),transparent_55%)]"
        />
        <Container size="wide" className="relative">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-accent-300">
            THORIUS KİTAPLIĞI
          </p>
          <h1 className="max-w-3xl font-serif text-4xl font-bold tracking-tight md:text-6xl">
            Konuşan Kitaplar
          </h1>
          <p className="mt-5 max-w-2xl text-base text-primary-100/90 md:text-lg">
            Kelimeleri takip ederek dinleyin. Basılı sipariş, güvenli e-kitap ve
            sesli okuma — aynı Thorius rafında.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#kitaplik-books"
              className="inline-flex items-center rounded-full bg-accent-500 px-5 py-2.5 text-sm font-semibold text-primary-950 transition hover:bg-accent-400"
            >
              Kitapları keşfet
            </a>
            <Link
              href="/kitaplarim"
              className="inline-flex items-center rounded-full border border-white/30 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Kitaplarım
            </Link>
          </div>
        </Container>
      </section>

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
              {books.length > 0
                ? `${books.length} kitap`
                : "Yakında yeni yayınlar"}
            </p>
          </div>

          {loadError ? (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Kitap listesi şu an yüklenemedi.
            </p>
          ) : null}

          {books.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book) => (
                <KitaplikBookCard
                  key={book.id}
                  book={book}
                  hasAudiobook={Boolean(hasAudiobookBySlug[book.slug])}
                />
              ))}
            </div>
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
