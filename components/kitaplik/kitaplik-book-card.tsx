import Link from "next/link";
import { Headphones } from "lucide-react";
import type { LibraryBookWithPricing } from "@/lib/kitaplik/types";
import { Card } from "@/components/ui/card";

interface KitaplikBookCardProps {
  book: LibraryBookWithPricing;
  hasAudiobook?: boolean;
}

export function KitaplikBookCard({ book, hasAudiobook = false }: KitaplikBookCardProps) {
  const printed = book.printedSalePrice ?? book.printedPrice;
  const ebook = book.ebookSalePrice ?? book.ebookPrice;

  return (
    <Card className="flex h-full flex-col overflow-hidden border-primary-100">
      <Link href={`/kitap/${book.slug}`} className="group block">
        <div className="relative flex aspect-[3/4] items-center justify-center overflow-hidden bg-primary-50 p-3">
          {book.cover_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.cover_image_url}
              alt={book.title}
              loading="lazy"
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-primary-400" />
          )}
          {hasAudiobook ? (
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary-950/90 px-2.5 py-1 text-xs font-semibold text-accent-300 shadow-sm backdrop-blur-sm">
              <Headphones className="h-3.5 w-3.5" />
              Sesli
            </span>
          ) : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {book.author ? (
            <p className="text-xs font-medium uppercase tracking-wide text-accent-700">
              {book.author}
            </p>
          ) : null}
          <Link href={`/kitap/${book.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-base font-semibold text-primary-950 hover:text-primary-700">
              {book.title}
            </h3>
          </Link>
          {book.subtitle ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
              {book.subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-auto space-y-2 text-sm">
          {printed ? (
            <p className="text-primary-800">
              Basılı:{" "}
              <span className="font-semibold">
                {printed.toLocaleString("tr-TR")}₺
              </span>
            </p>
          ) : null}
          {ebook ? (
            <p className="text-primary-800">
              E-kitap:{" "}
              <span className="font-semibold text-accent-700">
                {ebook.toLocaleString("tr-TR")}₺
              </span>
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
