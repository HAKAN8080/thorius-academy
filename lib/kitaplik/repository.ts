import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  enrichLibraryBookPricing,
} from "@/lib/kitaplik/fetch-wc-pricing";
import { parseLibraryBookCategory } from "@/lib/kitaplik/book-category";
import { fromLibraryBookLanguageDbValue } from "@/lib/kitaplik/book-language";
import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
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
    category: parseLibraryBookCategory(
      typeof row.category === "string" ? row.category : null,
    ),
    print_year:
      row.print_year === null || row.print_year === undefined
        ? null
        : Number(row.print_year),
    isbn: (row.isbn as string | null) ?? null,
    publisher: (row.publisher as string | null) ?? null,
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
  options?: { includeUnpublished?: boolean },
): Promise<LibraryBook | null> {
  const normalized = slug.trim().toLowerCase();
  if (!normalized) return null;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("library_books")
    .select("*")
    .eq("slug", normalized);

  if (!options?.includeUnpublished) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query.maybeSingle();

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

export async function listUserReadableEbooks(): Promise<OwnedLibraryBook[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  if (canAccessKitaplikAdmin(user.email)) {
    const admin = getSupabaseAdmin();
    const { data, error } = await admin
      .from("library_books")
      .select("*")
      .not("ebook_storage_path", "is", null)
      .order("updated_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      ...mapBookRow(row as Record<string, unknown>),
      granted_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
    }));
  }

  return listUserOwnedEbooks();
}
