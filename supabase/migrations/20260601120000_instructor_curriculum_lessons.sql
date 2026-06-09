ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role IN ('student', 'instructor', 'admin'));

UPDATE public.profiles
SET role = 'instructor'
WHERE wp_instructor_id IS NOT NULL
  AND role = 'student';

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'video';

ALTER TABLE public.lessons
DROP CONSTRAINT IF EXISTS lessons_type_check;

ALTER TABLE public.lessons
ADD CONSTRAINT lessons_type_check
CHECK (type IN ('video', 'text'));

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS content_md text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS duration_minutes integer;

UPDATE public.lessons
SET type = CASE
  WHEN video_url IS NOT NULL OR video_type IS NOT NULL THEN 'video'
  WHEN description IS NOT NULL AND btrim(description) <> '' THEN 'text'
  ELSE 'video'
END
WHERE type IS NULL OR type = 'video';

UPDATE public.lessons
SET content_md = description
WHERE content_md IS NULL
  AND description IS NOT NULL
  AND btrim(description) <> '';

UPDATE public.lessons
SET duration_minutes = GREATEST(1, ROUND(duration_seconds / 60.0)::integer)
WHERE duration_minutes IS NULL
  AND duration_seconds IS NOT NULL
  AND duration_seconds > 0;

CREATE INDEX IF NOT EXISTS lessons_course_id_order_idx
  ON public.lessons (course_id, lesson_order);

NOTIFY pgrst, 'reload schema';
