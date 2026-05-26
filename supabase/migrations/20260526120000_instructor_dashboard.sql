-- Eğitmen paneli: Tutor LMS → Supabase senkron tabloları

-- profiles tablosuna WP eğitmen ID ekle
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wp_instructor_id INTEGER;

CREATE INDEX IF NOT EXISTS profiles_wp_instructor_id_idx
  ON public.profiles (wp_instructor_id)
  WHERE wp_instructor_id IS NOT NULL;

-- Eğitmen profilleri (Tutor WP kullanıcıları)
CREATE TABLE IF NOT EXISTS public.instructors (
  wp_user_id INTEGER PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kurs istatistikleri
CREATE TABLE IF NOT EXISTS public.instructor_course_stats (
  wp_course_id INTEGER PRIMARY KEY,
  course_slug TEXT NOT NULL,
  instructor_wp_user_id INTEGER NOT NULL REFERENCES public.instructors (wp_user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'publish',
  enrollment_count INTEGER NOT NULL DEFAULT 0,
  rating_avg NUMERIC(3, 2) NOT NULL DEFAULT 0,
  rating_count INTEGER NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS instructor_course_stats_instructor_idx
  ON public.instructor_course_stats (instructor_wp_user_id);

CREATE INDEX IF NOT EXISTS instructor_course_stats_slug_idx
  ON public.instructor_course_stats (course_slug);

-- Kurs yorumları / değerlendirmeleri
CREATE TABLE IF NOT EXISTS public.instructor_course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wp_course_id INTEGER NOT NULL REFERENCES public.instructor_course_stats (wp_course_id) ON DELETE CASCADE,
  wp_review_id INTEGER NOT NULL UNIQUE,
  student_name TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  reviewed_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS instructor_course_reviews_course_idx
  ON public.instructor_course_reviews (wp_course_id);

-- RLS
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_course_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_course_reviews ENABLE ROW LEVEL SECURITY;

-- Eğitmen kendi kaydını okuyabilir
CREATE POLICY "instructors_select_own"
  ON public.instructors
  FOR SELECT
  TO authenticated
  USING (
    wp_user_id = (
      SELECT p.wp_instructor_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
    OR email = (SELECT auth.jwt() ->> 'email')
  );

-- Eğitmen kendi kurs istatistiklerini okuyabilir
CREATE POLICY "instructor_course_stats_select_own"
  ON public.instructor_course_stats
  FOR SELECT
  TO authenticated
  USING (
    instructor_wp_user_id = (
      SELECT p.wp_instructor_id
      FROM public.profiles p
      WHERE p.id = auth.uid()
    )
    OR instructor_wp_user_id IN (
      SELECT i.wp_user_id
      FROM public.instructors i
      WHERE i.email = (SELECT auth.jwt() ->> 'email')
    )
  );

-- Eğitmen kendi kurs yorumlarını okuyabilir
CREATE POLICY "instructor_course_reviews_select_own"
  ON public.instructor_course_reviews
  FOR SELECT
  TO authenticated
  USING (
    wp_course_id IN (
      SELECT s.wp_course_id
      FROM public.instructor_course_stats s
      WHERE s.instructor_wp_user_id = (
        SELECT p.wp_instructor_id
        FROM public.profiles p
        WHERE p.id = auth.uid()
      )
      OR s.instructor_wp_user_id IN (
        SELECT i.wp_user_id
        FROM public.instructors i
        WHERE i.email = (SELECT auth.jwt() ->> 'email')
      )
    )
  );

-- service_role senkron için tam erişim (RLS bypass)
