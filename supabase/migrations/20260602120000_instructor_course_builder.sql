-- Instructor course builder (adapted to WP integer course IDs + UUID course records)

ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS revenue_share_percent integer NOT NULL DEFAULT 70;

CREATE TABLE IF NOT EXISTS public.courses_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_course_id integer UNIQUE,
  instructor_wp_user_id integer NOT NULL REFERENCES public.instructors (wp_user_id) ON DELETE CASCADE,
  course_slug text,
  title text NOT NULL DEFAULT 'Yeni Kurs',
  subtitle text,
  description_md text,
  cover_image_url text,
  intro_video_url text,
  pricing_model text NOT NULL DEFAULT 'free' CHECK (pricing_model IN ('free', 'paid')),
  price numeric(10, 2) NOT NULL DEFAULT 0,
  sale_price numeric(10, 2),
  level text NOT NULL DEFAULT 'Başlangıç',
  language text NOT NULL DEFAULT 'Türkçe',
  category text,
  visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  what_will_learn text,
  target_audience text,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tablo daha önce eksik kolonlarla oluşmuş olabilir (CREATE TABLE IF NOT EXISTS atlar)
ALTER TABLE public.instructor_course_stats
ADD COLUMN IF NOT EXISTS instructor_wp_user_id integer;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS wp_course_id integer;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS instructor_wp_user_id integer;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS course_slug text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS title text NOT NULL DEFAULT 'Yeni Kurs';

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS subtitle text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS description_md text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS cover_image_url text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS intro_video_url text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS pricing_model text NOT NULL DEFAULT 'free';

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS price numeric(10, 2) NOT NULL DEFAULT 0;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS sale_price numeric(10, 2);

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS level text NOT NULL DEFAULT 'Başlangıç';

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'Türkçe';

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS category text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS visibility text NOT NULL DEFAULT 'public';

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS what_will_learn text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS target_audience text;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT false;

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.courses_cache
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS courses_cache_instructor_idx
  ON public.courses_cache (instructor_wp_user_id);

CREATE TABLE IF NOT EXISTS public.sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses_cache (id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Yeni Bölüm',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sections_course_sort_idx
  ON public.sections (course_id, sort_order);

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS section_id uuid REFERENCES public.sections (id) ON DELETE SET NULL;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS attachment_url text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS attachment_name text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS featured_image_url text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS courses_cache_id uuid REFERENCES public.courses_cache (id) ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wc_order_id integer UNIQUE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  total_amount numeric(10, 2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_wp_user_id integer NOT NULL REFERENCES public.instructors (wp_user_id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses_cache (id) ON DELETE SET NULL,
  wp_course_id integer,
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  wc_order_id integer,
  sale_amount numeric(10, 2) NOT NULL DEFAULT 0,
  instructor_share numeric(10, 2) NOT NULL DEFAULT 0,
  thorius_share numeric(10, 2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_out boolean NOT NULL DEFAULT false,
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS earnings_instructor_idx
  ON public.earnings (instructor_wp_user_id, created_at DESC);

INSERT INTO public.courses_cache (
  wp_course_id,
  instructor_wp_user_id,
  course_slug,
  title,
  cover_image_url,
  published,
  level,
  language
)
SELECT
  s.wp_course_id,
  s.instructor_wp_user_id,
  s.course_slug,
  s.title,
  s.image_url,
  CASE WHEN s.status = 'publish' THEN true ELSE false END,
  'Başlangıç',
  'Türkçe'
FROM public.instructor_course_stats s
WHERE s.instructor_wp_user_id IS NOT NULL
  AND NOT EXISTS (
  SELECT 1
  FROM public.courses_cache c
  WHERE c.wp_course_id = s.wp_course_id
);

UPDATE public.lessons l
SET courses_cache_id = c.id
FROM public.courses_cache c
WHERE l.courses_cache_id IS NULL
  AND c.wp_course_id = l.course_id;

ALTER TABLE public.courses_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Instructors read own courses_cache" ON public.courses_cache;
CREATE POLICY "Instructors read own courses_cache"
ON public.courses_cache FOR SELECT TO authenticated
USING (
  instructor_wp_user_id IN (
    SELECT wp_instructor_id FROM public.profiles WHERE id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Instructors read own sections" ON public.sections;
CREATE POLICY "Instructors read own sections"
ON public.sections FOR SELECT TO authenticated
USING (
  course_id IN (
    SELECT id FROM public.courses_cache
    WHERE instructor_wp_user_id IN (
      SELECT wp_instructor_id FROM public.profiles WHERE id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Instructors read own earnings" ON public.earnings;
CREATE POLICY "Instructors read own earnings"
ON public.earnings FOR SELECT TO authenticated
USING (
  instructor_wp_user_id IN (
    SELECT wp_instructor_id FROM public.profiles WHERE id = auth.uid()
  )
);

GRANT SELECT ON public.courses_cache TO authenticated;
GRANT SELECT ON public.sections TO authenticated;
GRANT SELECT ON public.earnings TO authenticated;
GRANT ALL ON public.courses_cache TO service_role;
GRANT ALL ON public.sections TO service_role;
GRANT ALL ON public.orders TO service_role;
GRANT ALL ON public.earnings TO service_role;

NOTIFY pgrst, 'reload schema';
