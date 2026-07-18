"use client";

import { useMemo, useState } from "react";
import { KitaplikBookCard } from "@/components/kitaplik/kitaplik-book-card";
import {
  LIBRARY_BOOK_CATEGORIES,
  type LibraryBookCategoryId,
} from "@/lib/kitaplik/book-category";
import type { LibraryBookWithPricing } from "@/lib/kitaplik/types";

interface KitaplikBookCatalogProps {
  books: LibraryBookWithPricing[];
  hasAudiobookBySlug: Record<string, boolean>;
}

export function KitaplikBookCatalog({
  books,
  hasAudiobookBySlug,
}: KitaplikBookCatalogProps) {
  const [category, setCategory] = useState<LibraryBookCategoryId | "all">("all");
  const [language, setLanguage] = useState<"all" | "tr" | "en">("all");

  const availableCategories = useMemo(() => {
    const present = new Set(
      books.map((book) => book.category).filter(Boolean) as LibraryBookCategoryId[],
    );
    return LIBRARY_BOOK_CATEGORIES.filter((item) => present.has(item.id));
  }, [books]);

  const filtered = useMemo(() => {
    return books.filter((book) => {
      if (category !== "all" && book.category !== category) return false;
      if (language !== "all" && book.language !== language) return false;
      return true;
    });
  }, [books, category, language]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              category === "all"
                ? "bg-primary-950 text-white"
                : "bg-primary-50 text-primary-800 hover:bg-primary-100"
            }`}
          >
            Tüm kategoriler
          </button>
          {availableCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCategory(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                category === item.id
                  ? "bg-primary-950 text-white"
                  : "bg-primary-50 text-primary-800 hover:bg-primary-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "Tüm diller"],
              ["tr", "TR"],
              ["en", "EN"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setLanguage(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                language === id
                  ? "bg-accent-500 text-primary-950"
                  : "border border-primary-100 bg-white text-primary-800 hover:bg-primary-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} / {books.length} kitap
      </p>

      {filtered.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((book) => (
            <KitaplikBookCard
              key={book.id}
              book={book}
              hasAudiobook={Boolean(hasAudiobookBySlug[book.slug])}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-primary-200 bg-primary-50/60 px-6 py-12 text-center">
          <p className="text-base font-medium text-primary-900">
            Bu filtreye uygun kitap yok.
          </p>
        </div>
      )}
    </div>
  );
}
