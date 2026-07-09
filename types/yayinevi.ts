export type ContextSetStatus = "draft" | "in_review" | "approved" | "rejected";
export type PublisherVisualType = "none" | "table" | "number_line";
export type PublisherDifficulty = "kolay" | "orta" | "zor";
export type QuestionOptionKey = "A" | "B" | "C" | "D";

export interface ContextQuestionOption {
  key: QuestionOptionKey;
  text: string;
}

export interface PipelineLogEntry {
  agent: string;
  at: string;
  summary: string;
  score?: number;
}

export interface ContextSetRow {
  id: string;
  outcome_id: string;
  process_component_id: string;
  title: string;
  context_body: string;
  visual_type: PublisherVisualType;
  visual_data: Record<string, unknown> | null;
  visual_svg: string | null;
  difficulty: PublisherDifficulty;
  source_note: string | null;
  status: ContextSetStatus;
  author_id: string;
  reviewer_notes: string | null;
  meb_checklist: Record<string, unknown>;
  pipeline_log: PipelineLogEntry[];
  quality_score: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContextQuestionRow {
  id: string;
  context_set_id: string;
  sort_order: number;
  stem: string;
  options: ContextQuestionOption[];
  correct_option: QuestionOptionKey;
  solution: string;
  distractor_rationale: Record<string, string>;
  process_component_letter: string | null;
}

export interface ContextSetWithQuestions extends ContextSetRow {
  questions: ContextQuestionRow[];
  outcome_code?: string;
  process_component_letter?: string;
}
