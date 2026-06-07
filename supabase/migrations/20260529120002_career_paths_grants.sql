-- API rollerinin career_paths tablolarına erişimi (42501 permission denied düzeltmesi)

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON public.career_paths TO anon, authenticated;
GRANT ALL ON public.career_paths TO service_role;

GRANT SELECT ON public.career_path_steps TO anon, authenticated;
GRANT ALL ON public.career_path_steps TO service_role;

GRANT SELECT, INSERT ON public.career_path_enrollments TO authenticated;
GRANT ALL ON public.career_path_enrollments TO service_role;

NOTIFY pgrst, 'reload schema';
