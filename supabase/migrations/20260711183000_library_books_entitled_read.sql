-- Sahip olunan e-kitaplar yayinda olmasa da Kitaplarim'da gorunsun.

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
