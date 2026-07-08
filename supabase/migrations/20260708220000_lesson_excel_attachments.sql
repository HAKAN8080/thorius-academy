-- Ders ekleri: Excel şablonu + course-media bucket genişletmesi
ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS excel_attachment_url text;

ALTER TABLE public.lessons
ADD COLUMN IF NOT EXISTS excel_attachment_name text;

UPDATE storage.buckets
SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ]::text[]
WHERE id = 'course-media';

NOTIFY pgrst, 'reload schema';
