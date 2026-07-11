import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { LibraryBook } from "@/lib/kitaplik/types";

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
    is_published: Boolean(row.is_published),
    sort_order: Number(row.sort_order ?? 0),
  };
}

export async function listAllLibraryBooksForAdmin(): Promise<LibraryBook[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapBookRow(row as Record<string, unknown>));
}

export async function getLibraryBookByIdForAdmin(
  id: string,
): Promise<LibraryBook | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("library_books")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapBookRow(data as Record<string, unknown>) : null;
}
