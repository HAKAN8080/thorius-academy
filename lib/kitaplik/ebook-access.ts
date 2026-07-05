import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getLibraryBookBySlug,
  userHasEbookEntitlement,
} from "@/lib/kitaplik/repository";
import type { LibraryBook } from "@/lib/kitaplik/types";

export async function assertEbookReadAccess(
  userId: string,
  slug: string,
): Promise<{ book: LibraryBook; pdfBytes: Uint8Array } | null> {
  const book = await getLibraryBookBySlug(slug);
  if (!book?.ebook_storage_path) {
    return null;
  }

  const entitled = await userHasEbookEntitlement(userId, book.id);
  if (!entitled) {
    return null;
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.storage
    .from("ebook-files")
    .download(book.ebook_storage_path);

  if (error || !data) {
    return null;
  }

  const buffer = await data.arrayBuffer();
  return {
    book,
    pdfBytes: new Uint8Array(buffer),
  };
}
