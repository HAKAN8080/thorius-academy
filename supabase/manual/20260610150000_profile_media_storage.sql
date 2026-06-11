-- profile-media storage bucket (prod için)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-media',
  'profile-media',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read profile media" ON storage.objects;
CREATE POLICY "Public read profile media"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'profile-media');

NOTIFY pgrst, 'reload schema';
