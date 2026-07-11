import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  hasKitaplikAdminReadAllAccess,
  userCanReadKitaplikEbook,
} from "@/lib/kitaplik/ebook-read-access";
import {
  getLibraryBookBySlug,
} from "@/lib/kitaplik/repository";
import type { LibraryBook } from "@/lib/kitaplik/types";

export async function assertEbookReadAccess(
  userId: string,
  userEmail: string | null | undefined,
  slug: string,
): Promise<{ book: LibraryBook; pdfBytes: Uint8Array } | null> {
  const includeUnpublished = hasKitaplikAdminReadAllAccess(userEmail);
  const book = await getLibraryBookBySlug(slug, {
    includeUnpublished,
  });
  if (!book?.ebook_storage_path) {
    return null;
  }

  const entitled = await userCanReadKitaplikEbook(
    userId,
    userEmail,
    book.id,
  );
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
