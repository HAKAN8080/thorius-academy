-- Tam kurulum: eksik kolonlar + bigint/uuid FK uyumu
-- Tek seferde çalıştırın (20260602120001 + 20260602120002 birleşik)

ALTER TABLE public.instructors
ADD COLUMN IF NOT EXISTS revenue_share_percent integer NOT NULL DEFAULT 70;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'instructor_course_stats'
  ) THEN
    ALTER TABLE public.instructor_course_stats
    ADD COLUMN IF NOT EXISTS instructor_wp_user_id integer;

    UPDATE public.instructor_course_stats s
    SET instructor_wp_user_id = i.wp_user_id
    FROM public.instructors i
    WHERE s.instructor_wp_user_id IS NULL
      AND i.email IS NOT NULL;
  END IF;
END $$;

-- courses_cache: mevcut tabloya eksik kolonları ekle
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

-- stats'tan instructor_wp_user_id doldur
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'instructor_course_stats'
      AND column_name = 'instructor_wp_user_id'
  ) THEN
    UPDATE public.courses_cache c
    SET instructor_wp_user_id = s.instructor_wp_user_id
    FROM public.instructor_course_stats s
    WHERE c.instructor_wp_user_id IS NULL
      AND c.wp_course_id IS NOT NULL
      AND s.wp_course_id = c.wp_course_id
      AND s.instructor_wp_user_id IS NOT NULL;

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
        SELECT 1 FROM public.courses_cache c
        WHERE c.wp_course_id = s.wp_course_id
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS courses_cache_wp_course_id_idx
  ON public.courses_cache (wp_course_id)
  WHERE wp_course_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS courses_cache_instructor_idx
  ON public.courses_cache (instructor_wp_user_id);

-- FK tiplerini mevcut courses_cache.id ve orders.id ile eşleştir
DO $$
DECLARE
  cache_id_type text;
  order_id_type text;
BEGIN
  SELECT data_type
  INTO cache_id_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'courses_cache'
    AND column_name = 'id';

  IF cache_id_type IS NULL THEN
    RAISE EXCEPTION 'courses_cache tablosu bulunamadı.';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'orders'
  ) THEN
    SELECT data_type
    INTO order_id_type
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orders'
      AND column_name = 'id';
  ELSE
    IF cache_id_type = 'bigint' THEN
      EXECUTE $sql$
        CREATE TABLE public.orders (
          id bigserial PRIMARY KEY,
          wc_order_id integer UNIQUE,
          user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
          total_amount numeric(10, 2) NOT NULL DEFAULT 0,
          status text NOT NULL DEFAULT 'completed',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      $sql$;
      order_id_type := 'bigint';
    ELSE
      EXECUTE $sql$
        CREATE TABLE public.orders (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          wc_order_id integer UNIQUE,
          user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
          total_amount numeric(10, 2) NOT NULL DEFAULT 0,
          status text NOT NULL DEFAULT 'completed',
          created_at timestamptz NOT NULL DEFAULT now()
        )
      $sql$;
      order_id_type := 'uuid';
    END IF;
  END IF;

  IF order_id_type IS NULL THEN
    RAISE EXCEPTION 'orders.id kolonu bulunamadı.';
  END IF;

  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS wc_order_id integer;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS total_amount numeric(10, 2) NOT NULL DEFAULT 0;
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'completed';
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();

  DROP TABLE IF EXISTS public.sections CASCADE;
  DROP TABLE IF EXISTS public.earnings CASCADE;

  ALTER TABLE public.lessons DROP COLUMN IF EXISTS courses_cache_id;
  ALTER TABLE public.lessons DROP COLUMN IF EXISTS section_id;

  EXECUTE format(
    $sql$
      CREATE TABLE public.sections (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        course_id %s NOT NULL REFERENCES public.courses_cache (id) ON DELETE CASCADE,
        title text NOT NULL DEFAULT 'Yeni Bölüm',
        sort_order integer NOT NULL DEFAULT 0,
        published boolean NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now()
      )
    $sql$,
    cache_id_type
  );

  ALTER TABLE public.lessons
    ADD COLUMN section_id uuid REFERENCES public.sections (id) ON DELETE SET NULL;

  EXECUTE format(
    'ALTER TABLE public.lessons ADD COLUMN courses_cache_id %s REFERENCES public.courses_cache (id) ON DELETE CASCADE',
    cache_id_type
  );

  EXECUTE format(
    $sql$
      CREATE TABLE public.earnings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        instructor_wp_user_id integer NOT NULL REFERENCES public.instructors (wp_user_id) ON DELETE CASCADE,
        course_id %s REFERENCES public.courses_cache (id) ON DELETE SET NULL,
        wp_course_id integer,
        order_id %s REFERENCES public.orders (id) ON DELETE SET NULL,
        wc_order_id integer,
        sale_amount numeric(10, 2) NOT NULL DEFAULT 0,
        instructor_share numeric(10, 2) NOT NULL DEFAULT 0,
        thorius_share numeric(10, 2) NOT NULL DEFAULT 0,
        created_at timestamptz NOT NULL DEFAULT now(),
        paid_out boolean NOT NULL DEFAULT false,
        paid_at timestamptz
      )
    $sql$,
    cache_id_type,
    order_id_type
  );
END $$;

ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS featured_image_url text;

CREATE INDEX IF NOT EXISTS sections_course_sort_idx
  ON public.sections (course_id, sort_order);

CREATE INDEX IF NOT EXISTS earnings_instructor_idx
  ON public.earnings (instructor_wp_user_id, created_at DESC);

UPDATE public.lessons l
SET courses_cache_id = c.id
FROM public.courses_cache c
WHERE l.courses_cache_id IS NULL
  AND c.wp_course_id = l.course_id;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wp_instructor_id integer;

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
