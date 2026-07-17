import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { KitaplikPurchaseButtons } from "@/components/kitaplik/kitaplik-purchase-buttons";
import { getAudiobookManifest } from "@/lib/kitaplik/audiobook-access";
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
