import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { loadGrade8MatematikTema1 } from "@/lib/yayinevi/curriculum/load-curriculum";
import type {
  ContextQuestionRow,
  ContextSetRow,
  ContextSetWithQuestions,
  ContextQuestionOption,
  PipelineLogEntry,
  PublisherDifficulty,
  PublisherVisualType,
} from "@/types/yayinevi";
import type { GeneratedQuestion } from "@/lib/yayinevi/validate-generation";
import type { PipelineOutput } from "@/lib/yayinevi/orchestrator/run-pipeline";

export async function ensurePublisherCurriculumSeeded(): Promise<void> {
  const admin = getSupabaseAdmin();
  const theme = loadGrade8MatematikTema1();

  const { data: existing } = await admin
    .from("publisher_curriculum_themes")
    .select("id")
    .eq("grade", theme.grade)
    .eq("subject", theme.subject)
    .eq("theme_number", theme.themeNumber)
    .maybeSingle();

  if (existing?.id) return;

  const { data: themeRow, error: themeError } = await admin
    .from("publisher_curriculum_themes")
    .insert({
      grade: theme.grade,
      subject: theme.subject,
      theme_number: theme.themeNumber,
      title: theme.title,
      tymm_unit_url: theme.tymmUnitUrl,
      area_skills: theme.areaSkills,
      conceptual_skills: theme.conceptualSkills,
    })
    .select("id")
    .single();

  if (themeError || !themeRow) {
    throw new Error(themeError?.message ?? "Tema eklenemedi");
  }

  for (const outcome of theme.outcomes) {
    const { data: outcomeRow, error: outcomeError } = await admin
      .from("publisher_learning_outcomes")
      .insert({
        theme_id: themeRow.id,
        code: outcome.code,
        title: outcome.title,
        content_framework: outcome.contentFramework,
        context_hints: outcome.contextHints,
        key_concepts: outcome.keyConcepts,
      })
      .select("id")
      .single();

    if (outcomeError || !outcomeRow) {
      throw new Error(outcomeError?.message ?? "Kazanım eklenemedi");
    }

    for (const pc of outcome.processComponents) {
      const { error: pcError } = await admin
        .from("publisher_process_components")
        .insert({
          outcome_id: outcomeRow.id,
          letter: pc.letter,
          description: pc.description,
        });
      if (pcError) throw new Error(pcError.message);
    }
  }
}

export async function getOutcomeIdsByCode(code: string): Promise<{
  outcomeId: string;
  components: Array<{ id: string; letter: string; description: string }>;
}> {
  await ensurePublisherCurriculumSeeded();
  const admin = getSupabaseAdmin();

  const { data: outcome, error } = await admin
    .from("publisher_learning_outcomes")
    .select("id")
    .eq("code", code)
    .single();

  if (error || !outcome) {
    throw new Error("Öğrenme çıktısı bulunamadı");
  }

  const { data: components } = await admin
    .from("publisher_process_components")
    .select("id, letter, description")
    .eq("outcome_id", outcome.id)
    .order("letter");

  return {
    outcomeId: outcome.id,
    components: components ?? [],
  };
}

function mapOptions(
  options: GeneratedQuestion["options"],
): ContextQuestionOption[] {
  return (["A", "B", "C", "D"] as const).map((key) => ({
    key,
    text: options[key],
  }));
}

export async function createContextSetFromPipeline(input: {
  authorId: string;
  outcomeCode: string;
  processComponentLetter: string;
  difficulty: PublisherDifficulty;
  pipeline: PipelineOutput;
}): Promise<string> {
  await ensurePublisherCurriculumSeeded();
  const admin = getSupabaseAdmin();
  const { outcomeId, components } = await getOutcomeIdsByCode(
    input.outcomeCode,
  );
  const component = components.find(
    (c) => c.letter === input.processComponentLetter,
  );
  if (!component) {
    throw new Error("Süreç bileşeni bulunamadı");
  }

  const { data: setRow, error: setError } = await admin
    .from("publisher_context_sets")
    .insert({
      outcome_id: outcomeId,
      process_component_id: component.id,
      title: input.pipeline.context.context_title,
      context_body: input.pipeline.context.context_body,
      visual_type: input.pipeline.visualType as PublisherVisualType,
      visual_data: input.pipeline.visualData,
      visual_svg: input.pipeline.visualSvg,
      difficulty: input.difficulty,
      source_note: input.pipeline.context.source_note ?? null,
      status: "draft",
      author_id: input.authorId,
      meb_checklist: input.pipeline.compliance.checklist,
      pipeline_log: input.pipeline.pipelineLog as PipelineLogEntry[],
      quality_score: input.pipeline.qualityScore,
    })
    .select("id")
    .single();

  if (setError || !setRow) {
    throw new Error(setError?.message ?? "Bağlam seti kaydedilemedi");
  }

  const questions = input.pipeline.questions.map((q, index) => ({
    context_set_id: setRow.id,
    sort_order: index + 1,
    stem: q.stem,
    options: mapOptions(q.options),
    correct_option: q.correct,
    solution: q.solution,
    distractor_rationale: q.distractors ?? {},
    process_component_letter: input.processComponentLetter,
  }));

  const { error: qError } = await admin
    .from("publisher_context_questions")
    .insert(questions);

  if (qError) throw new Error(qError.message);

  return setRow.id;
}

export async function listContextSetsForAuthor(
  authorId: string,
): Promise<ContextSetRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("publisher_context_sets")
    .select("*")
    .eq("author_id", authorId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as ContextSetRow[];
}

export async function getContextSetDetail(
  id: string,
  authorId: string,
): Promise<ContextSetWithQuestions | null> {
  const admin = getSupabaseAdmin();
  const { data: set, error } = await admin
    .from("publisher_context_sets")
    .select(
      `
      *,
      publisher_learning_outcomes ( code ),
      publisher_process_components ( letter )
    `,
    )
    .eq("id", id)
    .eq("author_id", authorId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!set) return null;

  const { data: questions } = await admin
    .from("publisher_context_questions")
    .select("*")
    .eq("context_set_id", id)
    .order("sort_order");

  const row = set as ContextSetRow & {
    publisher_learning_outcomes?: { code: string } | null;
    publisher_process_components?: { letter: string } | null;
  };

  return {
    ...(row as ContextSetRow),
    questions: (questions ?? []) as ContextQuestionRow[],
    outcome_code: row.publisher_learning_outcomes?.code,
    process_component_letter: row.publisher_process_components?.letter,
  };
}

export async function updateContextSetStatus(input: {
  id: string;
  authorId: string;
  status: ContextSetRow["status"];
  reviewerNotes?: string;
  mebChecklist?: Record<string, unknown>;
}): Promise<void> {
  const admin = getSupabaseAdmin();
  const { error } = await admin
    .from("publisher_context_sets")
    .update({
      status: input.status,
      reviewer_notes: input.reviewerNotes ?? null,
      meb_checklist: input.mebChecklist,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.id)
    .eq("author_id", input.authorId);

  if (error) throw new Error(error.message);
}
