-- courses_cache SEO kolonları (prod için)
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS seo_title text,
ADD COLUMN IF NOT EXISTS seo_description text,
ADD COLUMN IF NOT EXISTS seo_focus_keyword text;

NOTIFY pgrst, 'reload schema';
