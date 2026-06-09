-- Panel profil alanları + eğitmen başvuruları

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS bio text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url text;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wp_user_id integer;

CREATE TABLE IF NOT EXISTS public.instructor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  expertise text NOT NULL,
  motivation text NOT NULL,
  sample_course_url text,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS instructor_applications_user_pending_idx
  ON public.instructor_applications (user_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS instructor_applications_status_idx
  ON public.instructor_applications (status, created_at DESC);

ALTER TABLE public.instructor_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "instructor_applications_select_own" ON public.instructor_applications;
CREATE POLICY "instructor_applications_select_own"
  ON public.instructor_applications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "instructor_applications_insert_own" ON public.instructor_applications;
CREATE POLICY "instructor_applications_insert_own"
  ON public.instructor_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

GRANT SELECT, INSERT ON public.instructor_applications TO authenticated;
GRANT ALL ON public.instructor_applications TO service_role;
