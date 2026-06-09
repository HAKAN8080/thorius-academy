-- Öğrenci kayıtları (enrollments) + ders ilerlemesi (lesson_progress)
-- service_role legacy sync yazabilsin; authenticated kendi satırlarını okuyabilsin.

CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id bigint NOT NULL,
  course_slug text NOT NULL,
  course_title text NOT NULL,
  course_image text,
  course_category text,
  instructor_name text,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  progress integer NOT NULL DEFAULT 0,
  completed_at timestamptz,
  last_lesson_id bigint,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'cancelled')),
  source text,
  wc_order_id bigint
);

CREATE UNIQUE INDEX IF NOT EXISTS enrollments_user_course_slug_idx
  ON public.enrollments (user_id, course_slug);

CREATE INDEX IF NOT EXISTS enrollments_user_id_idx
  ON public.enrollments (user_id);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own" ON public.enrollments;
CREATE POLICY "enrollments_select_own"
  ON public.enrollments
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_insert_own" ON public.enrollments;
CREATE POLICY "enrollments_insert_own"
  ON public.enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_update_own" ON public.enrollments;
CREATE POLICY "enrollments_update_own"
  ON public.enrollments
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

GRANT ALL ON public.enrollments TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  course_id bigint NOT NULL,
  watched_seconds integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_watched_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS lesson_progress_user_lesson_idx
  ON public.lesson_progress (user_id, lesson_id);

CREATE INDEX IF NOT EXISTS lesson_progress_user_id_idx
  ON public.lesson_progress (user_id);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "lesson_progress_select_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_select_own"
  ON public.lesson_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "lesson_progress_insert_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_insert_own"
  ON public.lesson_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "lesson_progress_update_own" ON public.lesson_progress;
CREATE POLICY "lesson_progress_update_own"
  ON public.lesson_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

GRANT ALL ON public.lesson_progress TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.lesson_progress TO authenticated;
