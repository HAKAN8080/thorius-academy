-- lessons.published kolonu (prod şema önbelleği hatası için)
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'video';

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS content_md text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS section_id uuid;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS courses_cache_id uuid;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS featured_image_url text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS attachment_url text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS attachment_name text;

UPDATE public.lessons
SET published = false
WHERE published IS NULL;

NOTIFY pgrst, 'reload schema';
