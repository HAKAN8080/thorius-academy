-- Curriculum bilingual fields (Phase 2)
ALTER TABLE public.sections
  ADD COLUMN IF NOT EXISTS title_en text;

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS title_en text;
