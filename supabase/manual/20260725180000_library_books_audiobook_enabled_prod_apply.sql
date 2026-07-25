-- PROD apply: sesli kitap acik/kapali anahtari
-- node --env-file=.env.local scripts/apply-supabase-sql.mjs supabase/manual/20260725180000_library_books_audiobook_enabled_prod_apply.sql

ALTER TABLE public.library_books
  ADD COLUMN IF NOT EXISTS audiobook_enabled boolean NOT NULL DEFAULT false;

-- Halihazirda manifesti yayinda olan kitaplar acik kalsin (canliyi bozma).
UPDATE public.library_books
SET audiobook_enabled = true
WHERE slug IN (
  'aurora',
  'aurora-en',
  'pofi-nin-arkadaslari',
  'pofi-s-friends',
  'tellus-s-legacy'
);
