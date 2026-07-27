import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getLibraryBookByEbookProductId,
  getLibraryBookByPrintedProductId,
  getLibraryBookBySlug,
} from "@/lib/kitaplik/repository";
import type { LibraryBook } from "@/lib/kitaplik/types";

export interface FulfillEbookPurchaseResult {
  success: boolean;
  bookSlug?: string;
  alreadyGranted?: boolean;
  printedOnly?: boolean;
  error?: string;
}

async function resolveBookForWcProduct(
  wcProductId: number,
): Promise<{ book: LibraryBook; isEbookPurchase: boolean } | null> {
  const ebookBook = await getLibraryBookByEbookProductId(wcProductId);
  if (ebookBook) {
    return { book: ebookBook, isEbookPurchase: true };
  }

  const printedBook = await getLibraryBookByPrintedProductId(wcProductId);
  if (printedBook) {
    return { book: printedBook, isEbookPurchase: false };
  }

  return null;
}

export async function fulfillEbookPurchase(params: {
  userId: string;
  wcOrderId: number;
  wcProductId: number;
}): Promise<FulfillEbookPurchaseResult> {
  const resolved = await resolveBookForWcProduct(params.wcProductId);

  if (!resolved) {
    return { success: false, error: "Kitaplık kataloğunda bulunamadı" };
  }

  const { book, isEbookPurchase } = resolved;

  if (!isEbookPurchase) {
    return {
      success: true,
      bookSlug: book.slug,
      printedOnly: true,
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

  if (!book.ebook_storage_path) {
    console.warn(
      `[Kitaplik] E-kitap hakkı verildi ama PDF yok: ${book.slug}`,
    );
  }

  return { success: true, bookSlug: book.slug };
}

export async function isLibraryBookProductId(
  wcProductId: number,
): Promise<boolean> {
  const resolved = await resolveBookForWcProduct(wcProductId);
  return Boolean(resolved);
}

/** `ebook` | `printed` | null (not a library catalog product). */
export async function classifyLibraryWcProduct(
  wcProductId: number,
): Promise<"ebook" | "printed" | null> {
  const resolved = await resolveBookForWcProduct(wcProductId);
  if (!resolved) return null;
  return resolved.isEbookPurchase ? "ebook" : "printed";
}

export async function grantEbookEntitlementByEmail(params: {
  email: string;
  bookSlug?: string;
  ebookWcProductId?: number;
  wcOrderId?: number;
}): Promise<FulfillEbookPurchaseResult & { userId?: string }> {
  const email = params.email.trim().toLowerCase();
  if (!email) {
    return { success: false, error: "E-posta gerekli" };
  }

  let book: LibraryBook | null = null;

  if (params.ebookWcProductId) {
    book = await getLibraryBookByEbookProductId(params.ebookWcProductId);
  } else if (params.bookSlug) {
    book = await getLibraryBookBySlug(params.bookSlug, {
      includeUnpublished: true,
    });
  }

  if (!book) {
    return { success: false, error: "Kitap bulunamadı" };
  }

  if (!book.ebook_wc_product_id) {
    return {
      success: false,
      bookSlug: book.slug,
      error: "Bu kitabın e-kitap WC ürünü yok",
    };
  }

  const supabaseAdmin = getSupabaseAdmin();
  let userId: string | null = null;
  let page = 1;
  while (page <= 10 && !userId) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error) return { success: false, error: error.message };
    const match = data.users.find((u) => u.email?.toLowerCase() === email);
    if (match) userId = match.id;
    if (data.users.length < 200) break;
    page += 1;
  }

  if (!userId) {
    return { success: false, error: "Kullanıcı bulunamadı" };
  }

  const result = await fulfillEbookPurchase({
    userId,
    wcOrderId: params.wcOrderId ?? 0,
    wcProductId: book.ebook_wc_product_id,
  });

  return { ...result, userId };
}
