-- Sync API (service_role) instructors + course stats tablolarına yazabilsin.
-- RLS bypass olsa da PostgreSQL tablo GRANT'ı gerekir.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT ALL ON public.instructors TO service_role;
GRANT ALL ON public.instructor_course_stats TO service_role;
GRANT ALL ON public.instructor_course_reviews TO service_role;

GRANT SELECT ON public.instructors TO authenticated;
GRANT SELECT ON public.instructor_course_stats TO authenticated;
GRANT SELECT ON public.instructor_course_reviews TO authenticated;
