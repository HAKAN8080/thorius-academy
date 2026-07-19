import {
  BookOpen,
  Building2,
  CalendarDays,
  Hash,
  Languages,
  Tag,
  User,
} from "lucide-react";
import { libraryBookCategoryLabel } from "@/lib/kitaplik/book-category";
import { libraryBookLanguageLabel } from "@/lib/kitaplik/book-language";
import type { LibraryBook } from "@/lib/kitaplik/types";

interface KitaplikBookSpecsProps {
  book: LibraryBook;
}

interface SpecItem {
  key: string;
  label: string;
  value: string;
  icon: typeof User;
}

export function KitaplikBookSpecs({ book }: KitaplikBookSpecsProps) {
  const categoryLabel = libraryBookCategoryLabel(book.category);
  const items: SpecItem[] = [];

  if (book.author) {
    items.push({
      key: "author",
      label: "Yazar",
      value: book.author,
      icon: User,
    });
  }
  if (book.publisher) {
    items.push({
      key: "publisher",
      label: "Yayıncı",
      value: book.publisher,
      icon: Building2,
    });
  }
  items.push({
    key: "language",
    label: "Dil",
    value: libraryBookLanguageLabel(book.language) === "EN" ? "İngilizce" : "Türkçe",
    icon: Languages,
  });
  if (book.print_year) {
    items.push({
      key: "print_year",
      label: "Baskı tarihi",
      value: String(book.print_year),
      icon: CalendarDays,
    });
  }
  if (categoryLabel) {
    items.push({
      key: "category",
      label: "Kategori",
      value: categoryLabel,
      icon: Tag,
    });
  }
  if (book.page_count) {
    items.push({
      key: "page_count",
      label: "Sayfa",
      value: `${book.page_count} sayfa`,
      icon: BookOpen,
    });
  }
  if (book.isbn) {
    items.push({
      key: "isbn",
      label: "ISBN",
      value: book.isbn,
      icon: Hash,
    });
  }

  if (items.length === 0) return null;

  return (
    <section
      aria-label="Kitap bilgileri"
      className="rounded-2xl border border-primary-100 bg-white px-4 py-4 sm:px-5"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-500">
        Ürün bilgileri
      </h2>
      <ul className="divide-y divide-primary-100/80">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li
              key={item.key}
              className="flex items-start gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-accent-700">
                <Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1 leading-snug">
                <span className="text-primary-500">{item.label}: </span>
                <span className="font-medium text-primary-950">{item.value}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
