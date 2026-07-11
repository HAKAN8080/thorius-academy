-- PROD: Kitaplik library_books dil kolonu + Kitaplarim erisim politikasi
-- Supabase Dashboard > SQL Editor'da calistirin.
-- Sonra: Project Settings > API > "Reload schema cache" (veya 1-2 dk bekleyin).

ALTER TABLE public.library_books
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'turkish';

ALTER TABLE public.library_books
DROP CONSTRAINT IF EXISTS library_books_language_check;

ALTER TABLE public.library_books
ADD CONSTRAINT library_books_language_check
CHECK (language IN ('turkish', 'english'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'library_books'
      AND policyname = 'library_books_entitled_read'
  ) THEN
    CREATE POLICY "library_books_entitled_read"
      ON public.library_books
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1
          FROM public.ebook_entitlements e
          WHERE e.library_book_id = library_books.id
            AND e.user_id = auth.uid()
        )
      );
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
