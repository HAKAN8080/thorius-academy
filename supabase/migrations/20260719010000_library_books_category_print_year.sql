-- library_books: single category + print year

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS print_year integer;

ALTER TABLE public.library_books
  DROP CONSTRAINT IF EXISTS library_books_category_check;

ALTER TABLE public.library_books
  ADD CONSTRAINT library_books_category_check
  CHECK (
    category IS NULL
    OR category IN (
      'edebiyat',
      'cocuk-ve-genclik',
      'foreign-languages',
      'egitim-ve-sinav',
      'basvuru',
      'arastirma-tarih',
      'din-tasavvuf',
      'sanat-tasarim',
      'mistik-roman',
      'felsefe',
      'hobi',
      'bilim',
      'cizgi-roman',
      'manga',
      'mizah',
      'prestij'
    )
  );

ALTER TABLE public.library_books
  DROP CONSTRAINT IF EXISTS library_books_print_year_check;

ALTER TABLE public.library_books
  ADD CONSTRAINT library_books_print_year_check
  CHECK (
    print_year IS NULL
    OR (print_year >= 1800 AND print_year <= 2100)
  );

CREATE INDEX IF NOT EXISTS library_books_category_idx
  ON public.library_books (category)
  WHERE category IS NOT NULL;
