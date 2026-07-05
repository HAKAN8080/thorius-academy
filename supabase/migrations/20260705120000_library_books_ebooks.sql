-- Thorius Kitaplık: basılı + e-kitap kataloğu ve e-kitap erişim hakları

CREATE TABLE IF NOT EXISTS public.library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  author TEXT,
  cover_image_url TEXT,
  printed_wc_product_id INTEGER,
  ebook_wc_product_id INTEGER,
  ebook_storage_path TEXT,
  page_count INTEGER,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT library_books_printed_wc_unique UNIQUE (printed_wc_product_id),
  CONSTRAINT library_books_ebook_wc_unique UNIQUE (ebook_wc_product_id)
);

CREATE INDEX IF NOT EXISTS library_books_published_idx
  ON public.library_books (sort_order, title)
  WHERE is_published = true;

CREATE TABLE IF NOT EXISTS public.ebook_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  library_book_id UUID NOT NULL REFERENCES public.library_books (id) ON DELETE CASCADE,
  wc_order_id INTEGER NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT ebook_entitlements_user_book_unique UNIQUE (user_id, library_book_id),
  CONSTRAINT ebook_entitlements_order_book_unique UNIQUE (wc_order_id, library_book_id)
);

CREATE INDEX IF NOT EXISTS ebook_entitlements_user_idx
  ON public.ebook_entitlements (user_id, granted_at DESC);

ALTER TABLE public.library_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ebook_entitlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "library_books_public_read"
  ON public.library_books
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "ebook_entitlements_own_read"
  ON public.ebook_entitlements
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

GRANT SELECT ON public.library_books TO anon, authenticated;
GRANT SELECT ON public.ebook_entitlements TO authenticated;
GRANT ALL ON public.library_books TO service_role;
GRANT ALL ON public.ebook_entitlements TO service_role;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ebook-files',
  'ebook-files',
  false,
  104857600,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO NOTHING;
