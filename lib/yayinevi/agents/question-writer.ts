import { callLlmJson } from "@/lib/yayinevi/ai/llm-client";
import { MEB_CORE_RULES } from "@/lib/yayinevi/ai/prompts/meb-core";
import type { ContextDesignerOutput } from "@/lib/yayinevi/validate-generation";
import {
  questionWriterOutputSchema,
  type QuestionWriterOutput,
} from "@/lib/yayinevi/validate-generation";

export interface QuestionWriterInput {
  outcomeCode: string;
  processComponentLetter: string;
  processComponentDescription: string;
  context: ContextDesignerOutput;
  difficulty: string;
}

export async function runQuestionWriterAgent(
  input: QuestionWriterInput,
): Promise<QuestionWriterOutput> {
  const system = `Sen LGS/TYMM matematik soru yazarısın. Verilen bağlamdan TAM 2 çoktan seçmeli soru üret.
${MEB_CORE_RULES}

Her soru bağlamı kullanmalı. Sorular birbirine ipucu vermemeli.
JSON:
{
  "questions": [
    {
      "stem": "...",
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correct": "A|B|C|D",
      "solution": "...",
      "distractors": { "A": "yanılgı açıklaması (yanlış şıklar için)" }
    }
  ]
}`;

  const user = JSON.stringify(input, null, 2);
  const raw = await callLlmJson<unknown>({ system, user });
  return questionWriterOutputSchema.parse(raw);
}
