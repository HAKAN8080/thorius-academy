import { callLlmJson } from "@/lib/yayinevi/ai/llm-client";
import { MEB_CORE_RULES } from "@/lib/yayinevi/ai/prompts/meb-core";
import {
  contextDesignerOutputSchema,
  type ContextDesignerOutput,
} from "@/lib/yayinevi/validate-generation";

export interface ContextDesignerInput {
  outcomeCode: string;
  outcomeTitle: string;
  processComponentLetter: string;
  processComponentDescription: string;
  contextHints: string[];
  difficulty: string;
  contextTheme?: string;
}

export async function runContextDesignerAgent(
  input: ContextDesignerInput,
): Promise<ContextDesignerOutput> {
  const system = `Sen bir MEB uyumlu bağlam tasarımcısısın. Görevin: tek bir bağlam metni ve gerekiyorsa tablo verisi üretmek.
${MEB_CORE_RULES}

JSON şeması:
{
  "context_title": "string",
  "context_body": "string (en az 3 paragraf, gerçekçi senaryo)",
  "visual": {
    "type": "table" | "none",
    "headers": ["..."],
    "rows": [[...]]
  },
  "source_note": "kurgu veya TYMM ipucu"
}

Üslü ifade sorularında tablo genelde zamana bağlı artış gösterir. Görsel metni tekrar etmemeli; tablo çözüm için zorunlu olmalı.`;

  const user = JSON.stringify(input, null, 2);
  const raw = await callLlmJson<unknown>({ system, user });
  return contextDesignerOutputSchema.parse(raw);
}
