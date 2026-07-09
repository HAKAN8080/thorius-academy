import { runContextDesignerAgent } from "@/lib/yayinevi/agents/context-designer";
import { runDistractorSpecialistAgent } from "@/lib/yayinevi/agents/distractor-specialist";
import { runMathValidatorAgent } from "@/lib/yayinevi/agents/math-validator";
import { runMebComplianceAgent } from "@/lib/yayinevi/agents/meb-compliance-editor";
import { runQuestionWriterAgent } from "@/lib/yayinevi/agents/question-writer";
import {
  loadTemaProgress,
  resolvePipelineTarget,
} from "@/lib/yayinevi/orchestrator/progress";
import { renderTableSvg } from "@/lib/yayinevi/visual-templates/render-table-svg";
import type { PipelineLogEntry } from "@/types/yayinevi";
import type {
  ContextDesignerOutput,
  GeneratedQuestion,
  MebComplianceOutput,
} from "@/lib/yayinevi/validate-generation";

export interface PipelineInput {
  outcomeCode?: string;
  processComponentLetter?: string;
  difficulty?: "kolay" | "orta" | "zor";
  contextTheme?: string;
}

export interface PipelineOutput {
  context: ContextDesignerOutput;
  questions: GeneratedQuestion[];
  compliance: MebComplianceOutput;
  visualType: "none" | "table";
  visualData: Record<string, unknown> | null;
  visualSvg: string | null;
  qualityScore: number;
  pipelineLog: PipelineLogEntry[];
  status: "pending_human_review";
}

function log(
  entries: PipelineLogEntry[],
  agent: string,
  summary: string,
  score?: number,
): void {
  entries.push({
    agent,
    at: new Date().toISOString(),
    summary,
    score,
  });
}

export async function runYayineviPipeline(
  input: PipelineInput,
): Promise<PipelineOutput> {
  const pipelineLog: PipelineLogEntry[] = [];
  const progress = await loadTemaProgress().catch(() => undefined);
  const target = resolvePipelineTarget({ ...input, progress });

  log(
    pipelineLog,
    "curriculum-planner",
    `${target.outcomeCode} / SB ${target.processComponentLetter} hedeflendi`,
  );

  const context = await runContextDesignerAgent({
    outcomeCode: target.outcomeCode,
    outcomeTitle: target.outcomeTitle,
    processComponentLetter: target.processComponentLetter,
    processComponentDescription: target.processComponentDescription,
    contextHints: target.contextHints,
    difficulty: target.difficulty,
    contextTheme: target.contextTheme,
  });
  log(pipelineLog, "context-designer", context.context_title);

  let visualSvg: string | null = null;
  let visualData: Record<string, unknown> | null = null;
  const visualType = context.visual.type;

  if (
    context.visual.type === "table" &&
    context.visual.headers &&
    context.visual.rows
  ) {
    visualData = {
      headers: context.visual.headers,
      rows: context.visual.rows,
    };
    visualSvg = renderTableSvg({
      headers: context.visual.headers,
      rows: context.visual.rows,
    });
    log(pipelineLog, "visual-generator", "Tablo SVG üretildi");
  }

  const draftQuestions = await runQuestionWriterAgent({
    outcomeCode: target.outcomeCode,
    processComponentLetter: target.processComponentLetter,
    processComponentDescription: target.processComponentDescription,
    context,
    difficulty: target.difficulty,
  });
  log(
    pipelineLog,
    "question-writer",
    `${draftQuestions.questions.length} soru taslağı`,
  );

  const refined = await runDistractorSpecialistAgent({
    context,
    questions: draftQuestions.questions,
    outcomeCode: target.outcomeCode,
  });
  log(pipelineLog, "distractor-specialist", "Çeldiriciler iyileştirildi");

  const mathCheck = runMathValidatorAgent(refined.questions);
  if (!mathCheck.passed) {
    log(
      pipelineLog,
      "math-validator",
      `Uyarılar: ${mathCheck.issues.join("; ")}`,
    );
  } else {
    log(pipelineLog, "math-validator", "Yapısal doğrulama geçti");
  }

  const hasFunctionalVisual =
    visualType === "table" && Boolean(visualSvg);

  let compliance = await runMebComplianceAgent({
    context,
    questions: refined.questions,
    hasFunctionalVisual,
  });
  log(
    pipelineLog,
    "meb-compliance-editor",
    `Skor: ${compliance.score}`,
    compliance.score,
  );

  let questions = refined.questions;

  if (!compliance.passed && compliance.revision_notes) {
    const retry = await runQuestionWriterAgent({
      outcomeCode: target.outcomeCode,
      processComponentLetter: target.processComponentLetter,
      processComponentDescription: `${target.processComponentDescription}\n\nRevizyon notları: ${compliance.revision_notes}`,
      context,
      difficulty: target.difficulty,
    });
    questions = retry.questions;
    compliance = await runMebComplianceAgent({
      context,
      questions,
      hasFunctionalVisual,
    });
    log(
      pipelineLog,
      "meb-compliance-editor",
      `Revizyon sonrası skor: ${compliance.score}`,
      compliance.score,
    );
  }

  return {
    context,
    questions,
    compliance,
    visualType: visualType === "table" ? "table" : "none",
    visualData,
    visualSvg,
    qualityScore: compliance.score,
    pipelineLog,
    status: "pending_human_review",
  };
}
