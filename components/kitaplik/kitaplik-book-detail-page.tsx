import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { KitaplikPurchaseButtons } from "@/components/kitaplik/kitaplik-purchase-buttons";
import { getAudiobookManifest } from "@/lib/kitaplik/audiobook-access";
import { libraryBookCategoryLabel } from "@/lib/kitaplik/book-category";
import { libraryBookLanguageLabel } from "@/lib/kitaplik/book-language";
import { getKitaplikBookPurchaseState } from "@/lib/kitaplik/book-purchase-state";

interface KitaplikBookDetailPageProps {
  slug: string;
}

export async function KitaplikBookDetailPage({
  slug,
}: KitaplikBookDetailPageProps) {
  const { book, customer, hasEbookAccess, isLoggedIn } =
    await getKitaplikBookPurchaseState(slug);

  if (!book) {
    notFound();
  }

  const audiobook = await getAudiobookManifest(book.slug);

  return (
    <section className="py-10 md:py-14">
      <Container size="wide">
        <Link
          href="/"
          className="mb-6 inline-flex text-sm font-medium text-primary-700 hover:text-primary-950"
        >
          ← Tüm kitaplar
        </Link>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
          <div className="flex aspect-[3/4] items-center justify-center overflow-hidden rounded-2xl border border-primary-100 bg-primary-50 p-4">
            {book.cover_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={book.cover_image_url}
                alt={book.title}
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary-200 to-primary-300" />
            )}
          </div>

          <div className="space-y-6">
            <div>
              {book.author ? (
                <p className="text-sm font-semibold uppercase tracking-wide text-accent-700">
                  {book.author}
                </p>
              ) : null}
              <h1 className="mt-2 text-3xl font-bold text-primary-950 md:text-4xl">
                {book.title}
              </h1>
              {book.subtitle ? (
                <p className="mt-2 text-lg text-primary-700">{book.subtitle}</p>
              ) : null}
            </div>

            <dl className="grid gap-3 rounded-2xl border border-primary-100 bg-primary-50/50 p-4 text-sm sm:grid-cols-2">
              {book.author ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                    Yazar
                  </dt>
                  <dd className="mt-1 font-medium text-primary-950">{book.author}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                  Dil
                </dt>
                <dd className="mt-1 font-medium text-primary-950">
                  {libraryBookLanguageLabel(book.language)}
                </dd>
              </div>
              {book.print_year ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                    Baskı tarihi
                  </dt>
                  <dd className="mt-1 font-medium text-primary-950">{book.print_year}</dd>
                </div>
              ) : null}
              {book.category ? (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-primary-500">
                    Kategori
                  </dt>
                  <dd className="mt-1 font-medium text-primary-950">
                    {libraryBookCategoryLabel(book.category)}
                  </dd>
                </div>
              ) : null}
            </dl>

            <KitaplikPurchaseButtons
              bookSlug={book.slug}
              printedWcProductId={book.printed_wc_product_id}
              printedPrice={book.printedPrice}
              printedSalePrice={book.printedSalePrice}
              printedInStock={book.printedInStock}
              ebookWcProductId={book.ebook_wc_product_id}
              ebookPrice={book.ebookPrice}
              ebookSalePrice={book.ebookSalePrice}
              ebookInStock={book.ebookInStock}
              hasEbookAccess={hasEbookAccess}
              hasAudiobook={Boolean(audiobook)}
              isLoggedIn={isLoggedIn}
              customerEmail={customer?.email}
              customerFirstName={customer?.firstName}
              customerLastName={customer?.lastName}
            />

            {book.description ? (
              <div
                className="prose prose-primary max-w-none text-primary-800"
                dangerouslySetInnerHTML={{ __html: book.description }}
              />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
