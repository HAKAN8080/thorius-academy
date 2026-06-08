CREATE TABLE IF NOT EXISTS public.course_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  course_id integer NOT NULL,
  course_title text NOT NULL,
  participant_name text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT course_certificates_user_course_unique UNIQUE (user_id, course_id)
);

CREATE INDEX IF NOT EXISTS course_certificates_course_id_idx
  ON public.course_certificates (course_id);

ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own course certificates" ON public.course_certificates;
CREATE POLICY "Users can read own course certificates"
ON public.course_certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

GRANT SELECT ON public.course_certificates TO authenticated;
GRANT ALL ON public.course_certificates TO service_role;

NOTIFY pgrst, 'reload schema';
