"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { BookPlus, FileUp, Pencil, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  saveKitaplikBook,
  uploadKitaplikBookPdf,
} from "@/lib/actions/kitaplik-admin";
import { slugifyCourseTitle } from "@/lib/instructor/slugify-course-title";
import type { LibraryBook } from "@/lib/kitaplik/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface KitaplikBookAdminPanelProps {
  initialBooks: LibraryBook[];
}

interface BookFormState {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  description: string;
  author: string;
  cover_image_url: string;
  printed_wc_product_id: string;
  ebook_wc_product_id: string;
  page_count: string;
  sort_order: string;
  is_published: boolean;
}

const emptyForm = (): BookFormState => ({
  id: "",
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  author: "",
  cover_image_url: "",
  printed_wc_product_id: "",
  ebook_wc_product_id: "",
  page_count: "",
  sort_order: "0",
  is_published: false,
});

function bookToForm(book: LibraryBook): BookFormState {
  return {
    id: book.id,
    title: book.title,
    slug: book.slug,
    subtitle: book.subtitle ?? "",
    description: book.description ?? "",
    author: book.author ?? "",
    cover_image_url: book.cover_image_url ?? "",
    printed_wc_product_id:
      book.printed_wc_product_id != null ? String(book.printed_wc_product_id) : "",
    ebook_wc_product_id:
      book.ebook_wc_product_id != null ? String(book.ebook_wc_product_id) : "",
    page_count: book.page_count != null ? String(book.page_count) : "",
    sort_order: String(book.sort_order ?? 0),
    is_published: book.is_published,
  };
}

export function KitaplikBookAdminPanel({
  initialBooks,
}: KitaplikBookAdminPanelProps) {
  const [books, setBooks] = useState(initialBooks);
  const [form, setForm] = useState<BookFormState>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, startSave] = useTransition();
  const [isUploadingPdf, startUploadPdf] = useTransition();

  const editingBook = useMemo(
    () => books.find((book) => book.id === form.id) ?? null,
    [books, form.id],
  );

  function updateField<K extends keyof BookFormState>(
    key: K,
    value: BookFormState[K],
  ) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = slugifyCourseTitle(String(value));
      }
      return next;
    });
  }

  function loadBook(book: LibraryBook) {
    setForm(bookToForm(book));
    setSlugTouched(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setForm(emptyForm());
    setSlugTouched(false);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
  }

  async function uploadPdfForBook(bookId: string, file: File): Promise<boolean> {
    const pdfForm = new FormData();
    pdfForm.set("file", file);
    const uploadResult = await uploadKitaplikBookPdf(bookId, pdfForm);
    if ("error" in uploadResult) {
      toast.error(`PDF yuklenemedi: ${uploadResult.error}`);
      return false;
    }
    setBooks((current) =>
      current.map((book) =>
        book.id === bookId
          ? { ...book, ebook_storage_path: uploadResult.storagePath }
          : book,
      ),
    );
    if (pdfInputRef.current) {
      pdfInputRef.current.value = "";
    }
    toast.success("E-kitap PDF yuklendi.");
    return true;
  }

  function handleSave() {
    startSave(async () => {
      const payload = new FormData();
      if (form.id) payload.set("id", form.id);
      payload.set("title", form.title);
      payload.set("slug", form.slug);
      payload.set("subtitle", form.subtitle);
      payload.set("description", form.description);
      payload.set("author", form.author);
      payload.set("cover_image_url", form.cover_image_url);
      payload.set("printed_wc_product_id", form.printed_wc_product_id);
      payload.set("ebook_wc_product_id", form.ebook_wc_product_id);
      payload.set("page_count", form.page_count);
      payload.set("sort_order", form.sort_order);
      payload.set("is_published", form.is_published ? "true" : "false");

      const result = await saveKitaplikBook(payload);
      if ("error" in result) {
        toast.error(result.error);
        return;
      }

      setBooks((current) => {
        const exists = current.some((book) => book.id === result.book.id);
        if (exists) {
          return current.map((book) =>
            book.id === result.book.id ? result.book : book,
          );
        }
        return [result.book, ...current];
      });
      setForm(bookToForm(result.book));
      setSlugTouched(true);
      toast.success(form.id ? "Kitap guncellendi." : "Kitap olusturuldu.");

      const pdfFile = pdfInputRef.current?.files?.[0];
      if (pdfFile) {
        await uploadPdfForBook(result.book.id, pdfFile);
      }
    });
  }

  function handlePdfUploadOnly() {
    if (!form.id) {
      toast.error("Once kitabi kaydedin, sonra PDF yukleyin.");
      return;
    }

    const pdfFile = pdfInputRef.current?.files?.[0];
    if (!pdfFile) {
      toast.error("Lutfen bir PDF secin.");
      return;
    }

    startUploadPdf(async () => {
      await uploadPdfForBook(form.id, pdfFile);
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookPlus className="h-5 w-5 text-primary-700" />
            <h2 className="text-xl font-semibold text-primary-950">
              {form.id ? "Kitabi duzenle" : "Yeni kitap ekle"}
            </h2>
          </div>
          {form.id ? (
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Yeni kitap
            </Button>
          ) : null}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="title">Baslik *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="Kitap adi"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL) *</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(event) => {
                setSlugTouched(true);
                updateField("slug", event.target.value);
              }}
              placeholder="ornek-kitap"
            />
            {form.slug ? (
              <p className="text-xs text-muted-foreground">
                kitaplik.thorius.com.tr/kitap/{form.slug}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Yazar</Label>
            <Input
              id="author"
              value={form.author}
              onChange={(event) => updateField("author", event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="subtitle">Alt baslik</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(event) => updateField("subtitle", event.target.value)}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Aciklama</Label>
            <textarea
              id="description"
              rows={5}
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              className="w-full rounded-md border border-input px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cover_image_url">Kapak gorseli URL</Label>
            <Input
              id="cover_image_url"
              value={form.cover_image_url}
              onChange={(event) => updateField("cover_image_url", event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="printed_wc_product_id">Basili WC urun ID</Label>
            <Input
              id="printed_wc_product_id"
              type="number"
              min={1}
              value={form.printed_wc_product_id}
              onChange={(event) =>
                updateField("printed_wc_product_id", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ebook_wc_product_id">E-kitap WC urun ID</Label>
            <Input
              id="ebook_wc_product_id"
              type="number"
              min={1}
              value={form.ebook_wc_product_id}
              onChange={(event) =>
                updateField("ebook_wc_product_id", event.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_count">Sayfa sayisi</Label>
            <Input
              id="page_count"
              type="number"
              min={1}
              value={form.page_count}
              onChange={(event) => updateField("page_count", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sort_order">Siralama</Label>
            <Input
              id="sort_order"
              type="number"
              value={form.sort_order}
              onChange={(event) => updateField("sort_order", event.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:col-span-2">
            <input
              id="is_published"
              type="checkbox"
              checked={form.is_published}
              onChange={(event) => updateField("is_published", event.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="is_published">Yayinda (kitaplikta gorunsun)</Label>
          </div>

          <div className="space-y-2 md:col-span-2 rounded-xl border border-dashed border-primary-200 bg-primary-50/40 p-4">
            <Label htmlFor="ebook_pdf">E-kitap PDF</Label>
            <input
              ref={pdfInputRef}
              id="ebook_pdf"
              type="file"
              accept="application/pdf,.pdf"
              className="block w-full text-sm"
            />
            <p className="text-xs text-muted-foreground">
              PDF en fazla 100 MB. Kayit sirasinda secerseniz otomatik yuklenir.
            </p>
            {editingBook?.ebook_storage_path ? (
              <p className="text-xs text-green-700">
                Mevcut dosya: {editingBook.ebook_storage_path}
              </p>
            ) : (
              <p className="text-xs text-amber-700">
                Henuz PDF yuklenmemis - e-kitap satisi icin PDF gerekli.
              </p>
            )}
            {form.id ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUploadingPdf}
                onClick={handlePdfUploadOnly}
              >
                <FileUp className="mr-1.5 h-4 w-4" />
                {isUploadingPdf ? "Yukleniyor..." : "Sadece PDF yukle"}
              </Button>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Kaydediliyor..." : form.id ? "Guncelle" : "Kitabi olustur"}
          </Button>
          {form.id && form.is_published ? (
            <Button asChild variant="outline">
              <Link href={`/kitap/${form.slug}`} target="_blank">
                Onizle
              </Link>
            </Button>
          ) : null}
        </div>
      </section>

      <section className="rounded-2xl border border-primary-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-primary-950">
          Kitaplar ({books.length})
        </h2>
        {books.length === 0 ? (
          <p className="text-sm text-muted-foreground">Henuz kitap yok.</p>
        ) : (
          <div className="space-y-3">
            {books.map((book) => (
              <div
                key={book.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="font-medium text-primary-950">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.slug}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge variant={book.is_published ? "default" : "secondary"}>
                      {book.is_published ? "Yayinda" : "Taslak"}
                    </Badge>
                    <Badge variant={book.ebook_storage_path ? "outline" : "secondary"}>
                      {book.ebook_storage_path ? "PDF var" : "PDF yok"}
                    </Badge>
                  </div>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => loadBook(book)}>
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Duzenle
                </Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
