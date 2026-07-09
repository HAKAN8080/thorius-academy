import { callLlmJson } from "@/lib/yayinevi/ai/llm-client";
import { MEB_CORE_RULES } from "@/lib/yayinevi/ai/prompts/meb-core";
import { runAutomaticMebChecks } from "@/lib/yayinevi/meb-checklist";
import type { ContextDesignerOutput, GeneratedQuestion } from "@/lib/yayinevi/validate-generation";
import {
  mebComplianceOutputSchema,
  type MebComplianceOutput,
} from "@/lib/yayinevi/validate-generation";

export async function runMebComplianceAgent(input: {
  context: ContextDesignerOutput;
  questions: GeneratedQuestion[];
  hasFunctionalVisual: boolean;
}): Promise<MebComplianceOutput> {
  const auto = runAutomaticMebChecks({
    contextBody: input.context.context_body,
    questions: input.questions,
    hasFunctionalVisual: input.hasFunctionalVisual,
  });

  const system = `Sen MEB bağlam temelli soru uyum editörüsün.
${MEB_CORE_RULES}

Otomatik kontrol skoru: ${auto.score}
Otomatik sorunlar: ${auto.issues.join("; ") || "yok"}

JSON döndür:
{
  "score": 0-100,
  "passed": boolean (score>=70),
  "issues": ["..."],
  "checklist": { "madde_id": true/false },
  "revision_notes": "varsa"
}`;

  const user = JSON.stringify(
    {
      context: input.context,
      questions: input.questions,
      automatic: auto,
    },
    null,
    2,
  );

  try {
    const raw = await callLlmJson<unknown>({ system, user, temperature: 0.2 });
    const parsed = mebComplianceOutputSchema.parse(raw);
    return {
      ...parsed,
      checklist: { ...auto.checklist, ...parsed.checklist },
      score: Math.min(parsed.score, auto.score),
      passed: parsed.score >= 70 && auto.score >= 70,
    };
  } catch {
    return {
      score: auto.score,
      passed: auto.score >= 70,
      issues: auto.issues,
      checklist: auto.checklist,
    };
  }
}
