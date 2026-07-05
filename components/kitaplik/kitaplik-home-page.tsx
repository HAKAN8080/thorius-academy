import { Container } from "@/components/layout/container";
import { KitaplikBookCard } from "@/components/kitaplik/kitaplik-book-card";
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

  return (
    <>
      <section className="border-b border-primary-100 bg-gradient-to-br from-primary-950 via-primary-900 to-[#0a1228] py-14 text-white md:py-20">
        <Container size="wide">
          <p className="mb-3 text-sm font-semibold tracking-[0.2em] text-accent-300">
            THORIUS KİTAPLIĞI
          </p>
          <h1 className="max-w-3xl text-3xl font-bold md:text-5xl">
            Basılı kitap veya e-kitap — size uygun format
          </h1>
          <p className="mt-4 max-w-2xl text-base text-primary-100/90 md:text-lg">
            Perakende, planlama ve liderlik alanında uzmanlık kitapları. Basılı
            siparişler kargo ile; e-kitaplar yalnızca güvenli okuyucuda, indirilemez.
          </p>
        </Container>
      </section>

      <section className="py-10 md:py-14" aria-labelledby="kitaplik-books-heading">
        <Container size="wide">
          <div className="mb-8">
            <h2
              id="kitaplik-books-heading"
              className="text-2xl font-bold text-primary-950"
            >
              Kitaplar
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
                <KitaplikBookCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            !loadError && (
              <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
                <p className="text-base font-medium text-primary-900">
                  Henüz yayınlanmış kitap yok.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supabase <code>library_books</code> tablosuna kitap ekleyin;
                  basılı ve e-kitap WooCommerce ürün ID&apos;lerini eşleştirin.
                </p>
              </div>
            )
          )}
        </Container>
      </section>
    </>
  );
}
