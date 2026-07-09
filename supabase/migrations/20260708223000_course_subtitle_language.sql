-- Kurs dili + altyazı dili (courses_cache)
ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS subtitle_language text;

ALTER TABLE public.courses_cache
DROP CONSTRAINT IF EXISTS courses_cache_subtitle_language_check;

ALTER TABLE public.courses_cache
ADD CONSTRAINT courses_cache_subtitle_language_check
CHECK (
  subtitle_language IS NULL
  OR subtitle_language IN (
    'turkish',
    'english',
    'tr',
    'en',
    'Türkçe',
    'İngilizce'
  )
);

NOTIFY pgrst, 'reload schema';
