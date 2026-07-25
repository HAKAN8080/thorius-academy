-- Sesli kitap acik/kapali anahtari: manifest yuklu olsa bile admin kapatabilir.
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
