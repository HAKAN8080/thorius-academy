-- Tutor legacy kayıtlı, hiç WooCommerce satın alımı olmayan pazarlama segmenti.
-- Supabase Dashboard → SQL Editor (service role) ile çalıştırın.

WITH user_sources AS (
  SELECT
    user_id,
    bool_or(source = 'tutor_legacy') AS has_tutor_legacy,
    bool_or(source = 'wc_purchase' OR wc_order_id IS NOT NULL) AS has_wc_purchase,
    count(*) FILTER (
      WHERE source = 'tutor_legacy' AND status <> 'cancelled'
    ) AS tutor_course_count,
    max(progress) FILTER (WHERE source = 'tutor_legacy') AS max_progress,
    string_agg(
      DISTINCT course_slug,
      ', '
      ORDER BY course_slug
    ) FILTER (WHERE source = 'tutor_legacy') AS tutor_course_slugs
  FROM public.enrollments
  WHERE status <> 'cancelled'
  GROUP BY user_id
)
SELECT
  u.id AS user_id,
  u.email,
  coalesce(p.full_name, u.raw_user_meta_data ->> 'full_name') AS full_name,
  p.wp_user_id,
  s.tutor_course_count,
  s.max_progress,
  s.tutor_course_slugs,
  u.raw_user_meta_data ->> 'tutor_legacy_synced_at' AS tutor_synced_at,
  u.raw_user_meta_data ->> 'membership_renewal_campaign_at' AS campaign_sent_at,
  u.last_sign_in_at
FROM user_sources s
JOIN auth.users u ON u.id = s.user_id
LEFT JOIN public.profiles p ON p.id = s.user_id
WHERE s.has_tutor_legacy
  AND NOT s.has_wc_purchase
ORDER BY u.email;
