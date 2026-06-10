-- Prod: lessons + sections SELECT (müfredat vitrini / oynatıcı)
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT SELECT ON public.sections TO anon, authenticated;

NOTIFY pgrst, 'reload schema';
