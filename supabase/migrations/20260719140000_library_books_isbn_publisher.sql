-- library_books: ISBN + publisher

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS isbn text;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS publisher text;

CREATE INDEX IF NOT EXISTS library_books_isbn_idx
  ON public.library_books (isbn)
  WHERE isbn IS NOT NULL;
