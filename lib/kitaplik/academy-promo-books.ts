import { unstable_cache } from "next/cache";
import { listPublishedLibraryBooks } from "@/lib/kitaplik/repository";

export interface KitaplikPromoBook {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  cover_image_url: string | null;
}

const PROMO_BOOK_LIMIT = 5;
const REVALIDATE_SECONDS = 3600;

async function buildKitaplikPromoBooks(): Promise<KitaplikPromoBook[]> {
  const books = await listPublishedLibraryBooks();

  return books
    .filter((book) => book.cover_image_url?.trim())
    .slice(0, PROMO_BOOK_LIMIT)
    .map((book) => ({
      id: book.id,
      slug: book.slug,
      title: book.title,
      author: book.author,
      cover_image_url: book.cover_image_url,
    }));
}

export async function getKitaplikPromoBooksFromCache(): Promise<
  KitaplikPromoBook[]
> {
  return unstable_cache(
    buildKitaplikPromoBooks,
    ["kitaplik-academy-promo-books-v1"],
    {
      revalidate: REVALIDATE_SECONDS,
      tags: ["library-books", "kitaplik-promo"],
    },
  )();
}
