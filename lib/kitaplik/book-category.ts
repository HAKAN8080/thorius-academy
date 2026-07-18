export const LIBRARY_BOOK_CATEGORIES = [
  { id: "edebiyat", label: "Edebiyat" },
  { id: "cocuk-ve-genclik", label: "Çocuk ve Gençlik" },
  { id: "foreign-languages", label: "Foreign Languages" },
  { id: "egitim-ve-sinav", label: "Eğitim ve Sınav Kitapları" },
  { id: "basvuru", label: "Başvuru" },
  { id: "arastirma-tarih", label: "Araştırma - Tarih" },
  { id: "din-tasavvuf", label: "Din Tasavvuf" },
  { id: "sanat-tasarim", label: "Sanat - Tasarım" },
  { id: "mistik-roman", label: "Mistik Roman" },
  { id: "felsefe", label: "Felsefe" },
  { id: "hobi", label: "Hobi" },
  { id: "bilim", label: "Bilim" },
  { id: "cizgi-roman", label: "Çizgi Roman" },
  { id: "manga", label: "Manga" },
  { id: "mizah", label: "Mizah" },
  { id: "prestij", label: "Prestij Kitapları" },
] as const;

export type LibraryBookCategoryId =
  (typeof LIBRARY_BOOK_CATEGORIES)[number]["id"];

const CATEGORY_IDS = new Set<string>(
  LIBRARY_BOOK_CATEGORIES.map((item) => item.id),
);

export function isLibraryBookCategoryId(
  value: string | null | undefined,
): value is LibraryBookCategoryId {
  return Boolean(value && CATEGORY_IDS.has(value));
}

export function parseLibraryBookCategory(
  value: string | null | undefined,
): LibraryBookCategoryId | null {
  if (!value) return null;
  const trimmed = value.trim();
  return isLibraryBookCategoryId(trimmed) ? trimmed : null;
}

export function libraryBookCategoryLabel(
  category: LibraryBookCategoryId | null | undefined,
): string | null {
  if (!category) return null;
  return (
    LIBRARY_BOOK_CATEGORIES.find((item) => item.id === category)?.label ?? null
  );
}
