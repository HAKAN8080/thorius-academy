-- Prod manual: curriculum EN columns
ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS title_en text;
