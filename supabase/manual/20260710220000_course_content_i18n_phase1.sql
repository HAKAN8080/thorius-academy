-- Prod manual apply: bilingual course marketing content (Phase 1)
ALTER TABLE public.courses_cache
  ADD COLUMN IF NOT EXISTS title_en text,
  ADD COLUMN IF NOT EXISTS subtitle_en text,
  ADD COLUMN IF NOT EXISTS description_md_en text,
  ADD COLUMN IF NOT EXISTS what_will_learn_en text,
  ADD COLUMN IF NOT EXISTS target_audience_en text,
  ADD COLUMN IF NOT EXISTS seo_title_en text,
  ADD COLUMN IF NOT EXISTS seo_description_en text;
