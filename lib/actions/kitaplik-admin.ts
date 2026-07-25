"use server";

import { revalidatePath } from "next/cache";
import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
import {
  parseLibraryBookCategory,
  type LibraryBookCategoryId,
} from "@/lib/kitaplik/book-category";
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

const EBOOK_BUCKET = "ebook-files";
const EBOOK_MAX_BYTES = 100 * 1024 * 1024;

function buildEbookStoragePath(slug: string): string {
  return `${slug}/${slug}.pdf`;
}

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

function parseOptionalPrintYear(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  const year = Math.trunc(parsed);
  if (year < 1800 || year > 2100) return null;
  return year;
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
    category: parseLibraryBookCategory(
      typeof data.category === "string" ? data.category : null,
    ),
    print_year:
      data.print_year === null || data.print_year === undefined
        ? null
        : Number(data.print_year),
    isbn: (data.isbn as string | null) ?? null,
    publisher: (data.publisher as string | null) ?? null,
    is_published: Boolean(data.is_published),
    // Kolon migration'i uygulanmadiysa eski davranisi koru (manifest belirler).
    audiobook_enabled:
      data.audiobook_enabled === undefined
        ? true
        : Boolean(data.audiobook_enabled),
    sort_order: Number(data.sort_order ?? 0),
  };
}

type LibraryBookWritePayload = {
  title: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  author: string | null;
  cover_image_url: string | null;
  printed_wc_product_id: number | null;
  ebook_wc_product_id: number | null;
  page_count: number | null;
  language?: "turkish" | "english";
  category?: LibraryBookCategoryId | null;
  print_year?: number | null;
  isbn?: string | null;
  publisher?: string | null;
  sort_order: number;
  is_published: boolean;
  audiobook_enabled?: boolean;
  updated_at: string;
};

function isMissingLanguageColumnError(message: string): boolean {
  return (
    message.includes("Could not find the 'language' column") ||
    (message.includes("language") && message.includes("schema cache"))
  );
}

function isMissingCategoryOrYearColumnError(message: string): boolean {
  return (
    message.includes("Could not find the 'category' column") ||
    message.includes("Could not find the 'print_year' column") ||
    (message.includes("category") && message.includes("schema cache")) ||
    (message.includes("print_year") && message.includes("schema cache"))
  );
}

function isMissingIsbnOrPublisherColumnError(message: string): boolean {
  return (
    message.includes("Could not find the 'isbn' column") ||
    message.includes("Could not find the 'publisher' column") ||
    (message.includes("isbn") && message.includes("schema cache")) ||
    (message.includes("publisher") && message.includes("schema cache"))
  );
}

function isMissingAudiobookEnabledColumnError(message: string): boolean {
  return (
    message.includes("Could not find the 'audiobook_enabled' column") ||
    (message.includes("audiobook_enabled") && message.includes("schema cache"))
  );
}

function mapKitaplikDbError(message: string): string {
  if (isMissingLanguageColumnError(message)) {
    return "Supabase'de library_books.language kolonu henuz yok. SQL Editor'da supabase/manual/20260711180000_library_books_language_prod_apply.sql dosyasini calistirin, sonra API schema cache'i yenileyin.";
  }
  if (isMissingCategoryOrYearColumnError(message)) {
    return "Supabase'de library_books.category / print_year kolonlari henuz yok. SQL Editor'da supabase/manual/20260719010000_library_books_category_print_year_prod_apply.sql dosyasini calistirin.";
  }
  if (isMissingIsbnOrPublisherColumnError(message)) {
    return "Supabase'de library_books.isbn / publisher kolonlari henuz yok. SQL Editor'da supabase/manual/20260719140000_library_books_isbn_publisher_prod_apply.sql dosyasini calistirin.";
  }
  if (isMissingAudiobookEnabledColumnError(message)) {
    return "Supabase'de library_books.audiobook_enabled kolonu henuz yok. SQL Editor'da supabase/manual/20260725180000_library_books_audiobook_enabled_prod_apply.sql dosyasini calistirin.";
  }
  return message;
}

async function writeLibraryBook(
  admin: ReturnType<typeof getSupabaseAdmin>,
  payload: LibraryBookWritePayload,
  id?: string,
): Promise<
  | { book: LibraryBook; languageColumnSkipped: boolean }
  | { error: string }
> {
  const attempt = async (body: LibraryBookWritePayload) => {
    if (id) {
      return admin
        .from("library_books")
        .update(body)
        .eq("id", id)
        .select("*")
        .single();
    }

    return admin.from("library_books").insert(body).select("*").single();
  };

  let { data, error } = await attempt(payload);

  if (
    error &&
    isMissingAudiobookEnabledColumnError(error.message) &&
    payload.audiobook_enabled !== undefined
  ) {
    const withoutAudiobook = { ...payload };
    delete withoutAudiobook.audiobook_enabled;
    ({ data, error } = await attempt(withoutAudiobook));
  }

  if (
    error &&
    isMissingIsbnOrPublisherColumnError(error.message) &&
    (payload.isbn !== undefined || payload.publisher !== undefined)
  ) {
    const withoutIdentity = { ...payload };
    delete withoutIdentity.isbn;
    delete withoutIdentity.publisher;
    ({ data, error } = await attempt(withoutIdentity));
  }

  if (
    error &&
    isMissingCategoryOrYearColumnError(error.message) &&
    (payload.category !== undefined || payload.print_year !== undefined)
  ) {
    const withoutMeta = { ...payload };
    delete withoutMeta.category;
    delete withoutMeta.print_year;
    ({ data, error } = await attempt(withoutMeta));
  }

  if (
    error &&
    isMissingLanguageColumnError(error.message) &&
    payload.language !== undefined
  ) {
    const withoutLanguage = { ...payload };
    delete withoutLanguage.language;
    ({ data, error } = await attempt(withoutLanguage));
    if (!error && data) {
      return {
        book: mapBookRow(data as Record<string, unknown>),
        languageColumnSkipped: true,
      };
    }
  }

  if (error || !data) {
    return {
      error: mapKitaplikDbError(error?.message ?? "Kitap kaydedilemedi."),
    };
  }

  return {
    book: mapBookRow(data as Record<string, unknown>),
    languageColumnSkipped: false,
  };
}

function validateEbookPdfMeta(file: File): string | null {
  const allowedTypes = new Set([
    "application/pdf",
    "application/octet-stream",
    "",
  ]);

  if (!allowedTypes.has(file.type)) {
    return "Yalnizca PDF dosyasi yukleyebilirsiniz.";
  }
  if (file.size <= 0) {
    return "Bos dosya yuklenemez.";
  }
  if (file.size > EBOOK_MAX_BYTES) {
    return "E-kitap PDF en fazla 100 MB olabilir.";
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
): Promise<{ book: LibraryBook; warning?: string } | { error: string }> {
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

  const payload: LibraryBookWritePayload = {
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
    category: parseLibraryBookCategory(
      parseOptionalText(formData.get("category")),
    ),
    print_year: parseOptionalPrintYear(formData.get("print_year")),
    isbn: parseOptionalText(formData.get("isbn")),
    publisher: parseOptionalText(formData.get("publisher")),
    sort_order: parseOptionalInt(formData.get("sort_order")) ?? 0,
    is_published: formData.get("is_published") === "true",
    audiobook_enabled: formData.get("audiobook_enabled") === "true",
    updated_at: new Date().toISOString(),
  };

  const admin = getSupabaseAdmin();

  if (id) {
    const existing = await getLibraryBookByIdForAdmin(id);
    if (!existing) {
      return { error: "Kitap bulunamadi." };
    }

    const result = await writeLibraryBook(admin, payload, id);
    if ("error" in result) {
      return result;
    }

    revalidatePath("/");
    revalidatePath("/kitaplik-yonetim");
    revalidatePath(`/kitap/${slug}`);

    return {
      book: result.book,
      warning: result.languageColumnSkipped
        ? "Kitap kaydedildi ancak dil alani Supabase migration'i bekliyor (varsayilan TR)."
        : undefined,
    };
  }

  const result = await writeLibraryBook(admin, payload);
  if ("error" in result) {
    return result;
  }

  revalidatePath("/");
  revalidatePath("/kitaplik-yonetim");

  return {
    book: result.book,
    warning: result.languageColumnSkipped
      ? "Kitap kaydedildi ancak dil alani Supabase migration'i bekliyor (varsayilan TR)."
      : undefined,
  };
}

export async function prepareKitaplikBookPdfUpload(
  bookId: string,
): Promise<{ path: string; token: string } | { error: string }> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  const book = await getLibraryBookByIdForAdmin(bookId);
  if (!book) {
    return { error: "Kitap bulunamadi." };
  }

  const storagePath = buildEbookStoragePath(book.slug);
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.storage
    .from(EBOOK_BUCKET)
    .createSignedUploadUrl(storagePath, { upsert: true });

  if (error || !data?.token || !data.path) {
    return {
      error: error?.message ?? "PDF yukleme oturumu acilamadi.",
    };
  }

  return { path: data.path, token: data.token };
}

export async function finalizeKitaplikBookPdfUpload(
  bookId: string,
): Promise<{ storagePath: string } | { error: string }> {
  const access = await requireKitaplikAdminAction();
  if ("error" in access) return access;

  const book = await getLibraryBookByIdForAdmin(bookId);
  if (!book) {
    return { error: "Kitap bulunamadi." };
  }

  const storagePath = buildEbookStoragePath(book.slug);
  const admin = getSupabaseAdmin();

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

  const storagePath = buildEbookStoragePath(book.slug);
  const admin = getSupabaseAdmin();

  const { error: uploadError } = await admin.storage
    .from(EBOOK_BUCKET)
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
