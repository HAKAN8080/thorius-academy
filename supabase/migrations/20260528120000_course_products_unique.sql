-- Ensure course_products can be synced idempotently by WP course id and slug.
CREATE UNIQUE INDEX IF NOT EXISTS course_products_wp_course_id_key
  ON public.course_products (wp_course_id);

CREATE UNIQUE INDEX IF NOT EXISTS course_products_course_slug_key
  ON public.course_products (course_slug);
