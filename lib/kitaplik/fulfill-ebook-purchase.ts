import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getLibraryBookByEbookProductId } from "@/lib/kitaplik/repository";

export interface FulfillEbookPurchaseResult {
  success: boolean;
  bookSlug?: string;
  alreadyGranted?: boolean;
  error?: string;
}

export async function fulfillEbookPurchase(params: {
  userId: string;
  wcOrderId: number;
  wcProductId: number;
}): Promise<FulfillEbookPurchaseResult> {
  const book = await getLibraryBookByEbookProductId(params.wcProductId);

  if (!book) {
    return { success: false, error: "E-kitap kataloğunda bulunamadı" };
  }

  if (!book.ebook_storage_path) {
    return {
      success: false,
      bookSlug: book.slug,
      error: "E-kitap dosyası henüz yüklenmedi",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: existing } = await supabaseAdmin
    .from("ebook_entitlements")
    .select("id")
    .eq("user_id", params.userId)
    .eq("library_book_id", book.id)
    .maybeSingle();

  if (existing) {
    return {
      success: true,
      bookSlug: book.slug,
      alreadyGranted: true,
    };
  }

  const { error } = await supabaseAdmin.from("ebook_entitlements").insert({
    user_id: params.userId,
    library_book_id: book.id,
    wc_order_id: params.wcOrderId,
  });

  if (error) {
    return { success: false, bookSlug: book.slug, error: error.message };
  }

  return { success: true, bookSlug: book.slug };
}

export async function isLibraryBookProductId(
  wcProductId: number,
): Promise<boolean> {
  const book = await getLibraryBookByEbookProductId(wcProductId);
  if (book) return true;

  const supabaseAdmin = getSupabaseAdmin();
  const { data } = await supabaseAdmin
    .from("library_books")
    .select("id")
    .eq("printed_wc_product_id", wcProductId)
    .maybeSingle();

  return Boolean(data);
}
