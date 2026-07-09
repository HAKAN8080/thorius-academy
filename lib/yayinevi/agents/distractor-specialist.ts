import { callLlmJson } from "@/lib/yayinevi/ai/llm-client";
import { MEB_CORE_RULES } from "@/lib/yayinevi/ai/prompts/meb-core";
import type { ContextDesignerOutput, GeneratedQuestion } from "@/lib/yayinevi/validate-generation";
import {
  distractorOutputSchema,
  type QuestionWriterOutput,
} from "@/lib/yayinevi/validate-generation";

export async function runDistractorSpecialistAgent(input: {
  context: ContextDesignerOutput;
  questions: GeneratedQuestion[];
  outcomeCode: string;
}): Promise<QuestionWriterOutput> {
  const system = `Sen çeldirici (distractor) uzmanısın. Verilen soruların yanlış şıklarını güçlendir.
${MEB_CORE_RULES}

Doğru cevabı değiştirme. Şık metinlerini kavram yanılgılarına göre iyileştir.
Her yanlış şık için distractors alanında kısa gerekçe yaz.
Aynı JSON şemasını döndür: { "questions": [...] }`;

  const user = JSON.stringify(input, null, 2);
  const raw = await callLlmJson<unknown>({ system, user, temperature: 0.3 });
  return distractorOutputSchema.parse(raw);
}
