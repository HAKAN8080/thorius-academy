-- Kitap dili (TR / EN)

ALTER TABLE public.library_books
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'turkish';

ALTER TABLE public.library_books
DROP CONSTRAINT IF EXISTS library_books_language_check;

ALTER TABLE public.library_books
ADD CONSTRAINT library_books_language_check
CHECK (language IN ('turkish', 'english'));
