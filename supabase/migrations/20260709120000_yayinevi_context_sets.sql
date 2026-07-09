-- Thorius Yayınevi: TYMM bağlam temelli soru editörü (Faz 1)

CREATE TYPE public.publisher_context_status AS ENUM (
  'draft',
  'in_review',
  'approved',
  'rejected'
);

CREATE TYPE public.publisher_visual_type AS ENUM (
  'none',
  'table',
  'number_line'
);

CREATE TYPE public.publisher_difficulty AS ENUM (
  'kolay',
  'orta',
  'zor'
);

CREATE TABLE IF NOT EXISTS public.publisher_curriculum_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade SMALLINT NOT NULL,
  subject TEXT NOT NULL,
  theme_number SMALLINT NOT NULL,
  title TEXT NOT NULL,
  tymm_unit_url TEXT,
  area_skills JSONB NOT NULL DEFAULT '[]',
  conceptual_skills JSONB NOT NULL DEFAULT '[]',
  UNIQUE (grade, subject, theme_number)
);

CREATE TABLE IF NOT EXISTS public.publisher_learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.publisher_curriculum_themes (id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_framework TEXT[] NOT NULL DEFAULT '{}',
  context_hints TEXT[] NOT NULL DEFAULT '{}',
  key_concepts TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.publisher_process_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES public.publisher_learning_outcomes (id) ON DELETE CASCADE,
  letter TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (outcome_id, letter)
);

CREATE TABLE IF NOT EXISTS public.publisher_context_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES public.publisher_learning_outcomes (id),
  process_component_id UUID NOT NULL REFERENCES public.publisher_process_components (id),
  title TEXT NOT NULL,
  context_body TEXT NOT NULL,
  visual_type public.publisher_visual_type NOT NULL DEFAULT 'none',
  visual_data JSONB,
  visual_svg TEXT,
  difficulty public.publisher_difficulty NOT NULL DEFAULT 'orta',
  source_note TEXT,
  status public.publisher_context_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reviewer_notes TEXT,
  meb_checklist JSONB NOT NULL DEFAULT '{}',
  pipeline_log JSONB NOT NULL DEFAULT '[]',
  quality_score SMALLINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.publisher_context_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_set_id UUID NOT NULL REFERENCES public.publisher_context_sets (id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  solution TEXT NOT NULL,
  distractor_rationale JSONB NOT NULL DEFAULT '{}',
  process_component_letter TEXT,
  UNIQUE (context_set_id, sort_order)
);

CREATE INDEX IF NOT EXISTS publisher_context_sets_author_idx
  ON public.publisher_context_sets (author_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS publisher_context_sets_status_idx
  ON public.publisher_context_sets (status);

ALTER TABLE public.publisher_curriculum_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_process_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_context_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_context_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "publisher_curriculum_read"
  ON public.publisher_curriculum_themes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "publisher_outcomes_read"
  ON public.publisher_learning_outcomes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "publisher_components_read"
  ON public.publisher_process_components
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "publisher_context_sets_author"
  ON public.publisher_context_sets
  FOR ALL
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "publisher_context_questions_via_set"
  ON public.publisher_context_questions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.publisher_context_sets s
      WHERE s.id = context_set_id AND s.author_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.publisher_context_sets s
      WHERE s.id = context_set_id AND s.author_id = auth.uid()
    )
  );

GRANT SELECT ON public.publisher_curriculum_themes TO authenticated;
GRANT SELECT ON public.publisher_learning_outcomes TO authenticated;
GRANT SELECT ON public.publisher_process_components TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publisher_context_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publisher_context_questions TO authenticated;
GRANT ALL ON public.publisher_curriculum_themes TO service_role;
GRANT ALL ON public.publisher_learning_outcomes TO service_role;
GRANT ALL ON public.publisher_process_components TO service_role;
GRANT ALL ON public.publisher_context_sets TO service_role;
GRANT ALL ON public.publisher_context_questions TO service_role;
