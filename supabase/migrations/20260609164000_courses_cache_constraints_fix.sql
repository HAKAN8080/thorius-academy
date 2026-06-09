-- Legacy courses_cache check constraint'lerini Academy builder ile uyumlu hale getir.

ALTER TABLE public.courses_cache
DROP CONSTRAINT IF EXISTS courses_cache_level_check;

ALTER TABLE public.courses_cache
DROP CONSTRAINT IF EXISTS courses_cache_language_check;

ALTER TABLE public.courses_cache
DROP CONSTRAINT IF EXISTS courses_cache_visibility_check;

ALTER TABLE public.courses_cache
DROP CONSTRAINT IF EXISTS courses_cache_pricing_model_check;

ALTER TABLE public.courses_cache
ADD CONSTRAINT courses_cache_level_check
CHECK (
  level IN (
    'beginner',
    'intermediate',
    'expert',
    'advanced',
    'all_levels',
    'Başlangıç',
    'Orta',
    'İleri'
  )
);

ALTER TABLE public.courses_cache
ADD CONSTRAINT courses_cache_language_check
CHECK (
  language IN (
    'turkish',
    'english',
    'tr',
    'en',
    'Türkçe',
    'İngilizce'
  )
);

ALTER TABLE public.courses_cache
ADD CONSTRAINT courses_cache_visibility_check
CHECK (visibility IN ('public', 'private'));

ALTER TABLE public.courses_cache
ADD CONSTRAINT courses_cache_pricing_model_check
CHECK (pricing_model IN ('free', 'paid'));

ALTER TABLE public.courses_cache
ALTER COLUMN level SET DEFAULT 'beginner';

ALTER TABLE public.courses_cache
ALTER COLUMN language SET DEFAULT 'turkish';
