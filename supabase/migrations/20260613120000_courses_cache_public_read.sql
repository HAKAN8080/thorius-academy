-- Kurs kataloğu (/kurslar): yayınlanmış ve herkese açık courses_cache okuma

GRANT SELECT ON public.courses_cache TO anon, authenticated;

DROP POLICY IF EXISTS "courses_cache_public_read" ON public.courses_cache;
CREATE POLICY "courses_cache_public_read"
  ON public.courses_cache
  FOR SELECT
  TO anon, authenticated
  USING (published = true AND visibility = 'public');
