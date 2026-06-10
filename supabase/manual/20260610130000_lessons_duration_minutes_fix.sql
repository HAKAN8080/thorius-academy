-- lessons.duration_minutes kolonu (prod şema önbelleği hatası için)
-- Supabase SQL Editor'de bir kez çalıştırın.

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS duration_minutes integer;

UPDATE public.lessons
SET duration_minutes = GREATEST(1, ROUND(duration_seconds / 60.0)::integer)
WHERE duration_minutes IS NULL
  AND duration_seconds IS NOT NULL
  AND duration_seconds > 0;

NOTIFY pgrst, 'reload schema';
