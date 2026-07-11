"use server";

import { revalidatePath } from "next/cache";
import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
import {
  fromLibraryBookLanguageDbValue,
  toLibraryBookLanguageDbValue,
} from "@/lib/kitaplik/book-language";
import {
  getLibraryBookByIdForAdmin,
  listAllLibraryBooksForAdmin,
} from "@/lib/kitaplik/admin-repository";
import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { validateLessonPdfBuffer } from "@/lib/upload/file-guard";
import type { LibraryBook } from "@/lib/kitaplik/types";

const EBOOK_MAX_BYTES = 100 * 1024 * 1024;

async function requireKitaplikAdminAction(): Promise<
  { userId: string; email: string } | { error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    return { error: "Bu islem icin giris yapmalisiniz." };
  }

  const email = user.email?.trim() ?? "";
  if (!canAccessKitaplikAdmin(email)) {
    return { error: "Bu sayfaya erisim yetkiniz yok." };
  }

  return { userId: user.id, email };
}

function parseOptionalInt(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.trunc(parsed) : null;
}

function parseOptionalText(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function mapBookRow(data: Record<string, unknown>): LibraryBook {
  return {
    id: String(data.id),
    slug: String(data.slug),
    title: String(data.title),
    subtitle: (data.subtitle as string | null) ?? null,
    description: (data.description as string | null) ?? null,
    author: (data.author as string | null) ?? null,
    cover_image_url: (data.cover_image_url as string | null) ?? null,
    printed_wc_product_id:
      data.printed_wc_product_id === null
        ? null
        : Number(data.printed_wc_product_id),
    ebook_wc_product_id:
      data.ebook_wc_product_id === null
        ? null
        : Number(data.ebook_wc_product_id),
    ebook_storage_path: (data.ebook_storage_path as string | null) ?? null,
    page_count: data.page_count === null ? null : Number(data.page_count),
    language: fromLibraryBookLanguageDbValue(data.language as string | null),
    is_published: Boolean(data.is_published),
    sort_order: Number(data.sort_order ?? 0),
  };
}

function validateEbookPdfMeta(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Yalnizca PDF dosyasi yukleyebilirsiniz.";
  }
  if (file.size <= 0) {
    return "Bos dosya yuklenemez.";
  }
  if (file.size > EBOOK_MAX_BYTES) {
    return "E-kitap PDF en fazla 100 MB olabilir.";
  }
  if (!file.name.toLowerCase().endsWith(".pdf")) {
    return "Dosya uzantisi .pdf olmalidir.";
  }
  return null;
}

export async function listKitaplikAdminBooks(): Promise<
  { books: LibraryBook[] } | { error: string }
> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  try {
    const books = await listAllLibraryBooksForAdmin();
    return { books };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Kitaplar yuklenemedi.",
    };
  }
}

export async function saveKitaplikBook(
  formData: FormData,
): Promise<{ book: LibraryBook } | { error: string }> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  const id = parseOptionalText(formData.get("id"));
  const title = parseOptionalText(formData.get("title"));
  const slugInput = parseOptionalText(formData.get("slug"));
  const slug = (slugInput || (title ? slugifyCourseTitle(title) : "")).trim();

  if (!title) {
    return { error: "Kitap basligi zorunludur." };
  }
  if (!slug) {
    return { error: "URL slug zorunludur." };
  }

  const payload = {
    title,
    slug,
    subtitle: parseOptionalText(formData.get("subtitle")),
    description: parseOptionalText(formData.get("description")),
    author: parseOptionalText(formData.get("author")),
    cover_image_url: parseOptionalText(formData.get("cover_image_url")),
    printed_wc_product_id: parseOptionalInt(formData.get("printed_wc_product_id")),
    ebook_wc_product_id: parseOptionalInt(formData.get("ebook_wc_product_id")),
    page_count: parseOptionalInt(formData.get("page_count")),
    language: toLibraryBookLanguageDbValue(
      parseOptionalText(formData.get("language")),
    ),
    sort_order: parseOptionalInt(formData.get("sort_order")) ?? 0,
    is_published: formData.get("is_published") === "true",
    updated_at: new Date().toISOString(),
  };

  const admin = getSupabaseAdmin();

  if (id) {
    const existing = await getLibraryBookByIdForAdmin(id);
    if (!existing) {
      return { error: "Kitap bulunamadi." };
    }

    const { data, error } = await admin
      .from("library_books")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Kitap guncellenemedi." };
    }

    revalidatePath("/");
    revalidatePath("/kitaplik-yonetim");
    revalidatePath(`/kitap/${slug}`);

    return { book: mapBookRow(data as Record<string, unknown>) };
  }

  const { data, error } = await admin
    .from("library_books")
    .insert(payload)
    .select("*")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Kitap olusturulamadi." };
  }

  revalidatePath("/");
  revalidatePath("/kitaplik-yonetim");

  return { book: mapBookRow(data as Record<string, unknown>) };
}

export async function uploadKitaplikBookPdf(
  bookId: string,
  formData: FormData,
): Promise<{ storagePath: string } | { error: string }> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  const book = await getLibraryBookByIdForAdmin(bookId);
  if (!book) {
    return { error: "Kitap bulunamadi." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Lutfen bir PDF secin." };
  }

  const metaError = validateEbookPdfMeta(file);
  if (metaError) {
    return { error: metaError };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const bufferError = validateLessonPdfBuffer(buffer);
  if (bufferError) {
    return { error: bufferError };
  }

  const storagePath = `${book.slug}/${book.slug}.pdf`;
  const admin = getSupabaseAdmin();

  const { error: uploadError } = await admin.storage
    .from("ebook-files")
    .upload(storagePath, buffer, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { error: updateError } = await admin
    .from("library_books")
    .update({
      ebook_storage_path: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookId);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/");
  revalidatePath("/kitaplik-yonetim");
  revalidatePath(`/kitap/${book.slug}`);

  return { storagePath };
}
