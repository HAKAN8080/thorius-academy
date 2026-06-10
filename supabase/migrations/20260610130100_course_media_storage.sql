-- Kurs ve ders kapak görselleri için public storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-media',
  'course-media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read course media" ON storage.objects;
CREATE POLICY "Public read course media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'course-media');

NOTIFY pgrst, 'reload schema';
