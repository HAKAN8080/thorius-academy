-- PROD apply: ISBN + publisher
-- node --env-file=.env.local scripts/apply-supabase-sql.mjs supabase/manual/20260719140000_library_books_isbn_publisher_prod_apply.sql

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS isbn text;

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS publisher text;

CREATE INDEX IF NOT EXISTS library_books_isbn_idx
  ON public.library_books (isbn)
  WHERE isbn IS NOT NULL;
