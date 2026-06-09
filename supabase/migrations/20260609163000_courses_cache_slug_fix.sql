-- Production courses_cache tablosunda legacy `slug` kolonu zorunlu olabilir.
-- course_slug ile slug'ı eşitle.

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS slug text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS course_slug text;

UPDATE public.courses_cache
SET slug = course_slug
WHERE slug IS NULL
  AND course_slug IS NOT NULL;

UPDATE public.courses_cache
SET course_slug = slug
WHERE course_slug IS NULL
  AND slug IS NOT NULL;

UPDATE public.courses_cache c
SET slug = s.course_slug,
    course_slug = s.course_slug
FROM public.instructor_course_stats s
WHERE c.wp_course_id = s.wp_course_id
  AND (c.slug IS NULL OR c.course_slug IS NULL)
  AND s.course_slug IS NOT NULL;
