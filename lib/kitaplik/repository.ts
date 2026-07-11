import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  enrichLibraryBookPricing,
} from "@/lib/kitaplik/fetch-wc-pricing";
import { fromLibraryBookLanguageDbValue } from "@/lib/kitaplik/book-language";
import type {
  LibraryBook,
  LibraryBookWithPricing,
  OwnedLibraryBook,
} from "@/lib/kitaplik/types";

function mapBookRow(row: Record<string, unknown>): LibraryBook {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    subtitle: (row.subtitle as string | null) ?? null,
    description: (row.description as string | null) ?? null,
    author: (row.author as string | null) ?? null,
    cover_image_url: (row.cover_image_url as string | null) ?? null,
    printed_wc_product_id:
      row.printed_wc_product_id === null
        ? null
        : Number(row.printed_wc_product_id),
    ebook_wc_product_id:
      row.ebook_wc_product_id === null
        ? null
        : Number(row.ebook_wc_product_id),
    ebook_storage_path: (row.ebook_storage_path as string | null) ?? null,
    page_count:
      row.page_count === null ? null : Number(row.page_count),
    language: fromLibraryBookLanguageDbValue(row.language as string | null),
    is_published: Boolean(row.is_published),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function listPublishedLibraryBooks(): Promise<LibraryBook[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("is_published", true)
    .order("sort_order", { ascending: true })
    .order("title", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapBookRow(row as Record<string, unknown>));
}

export async function listPublishedLibraryBooksWithPricing(): Promise<
  LibraryBookWithPricing[]
> {
  const books = await listPublishedLibraryBooks();
  return Promise.all(books.map((book) => enrichLibraryBookPricing(book)));
}

export async function getLibraryBookBySlug(
  slug: string,
): Promise<LibraryBook | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("slug", normalized)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapBookRow(data as Record<string, unknown>) : null;
}

export async function getLibraryBookByEbookProductId(
  wcProductId: number,
): Promise<LibraryBook | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("ebook_wc_product_id", wcProductId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapBookRow(data as Record<string, unknown>) : null;
}

export async function userHasEbookEntitlement(
  userId: string,
  libraryBookId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("ebook_entitlements")
    .select("id")
    .eq("user_id", userId)
    .eq("library_book_id", libraryBookId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function listUserOwnedEbooks(): Promise<OwnedLibraryBook[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .from("ebook_entitlements")
    .select("granted_at, library_books!inner(*)")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });

  if (error) {
    throw new Error(`E-kitaplar yuklenemedi: ${error.message}`);
  }

  return (data ?? []).map((row) => {
    const book = row.library_books as unknown as Record<string, unknown>;
    const mapped = mapBookRow(book);
    return {
      ...mapped,
      granted_at: String(row.granted_at),
    };
  });
}
