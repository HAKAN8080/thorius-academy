import { z } from "zod";

const optionKeySchema = z.enum(["A", "B", "C", "D"]);

export const generatedQuestionSchema = z.object({
  stem: z.string().min(20),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  correct: optionKeySchema,
  solution: z.string().min(10),
  distractors: z.record(z.string(), z.string()).optional(),
});

export const contextDesignerOutputSchema = z.object({
  context_title: z.string().min(5),
  context_body: z.string().min(80),
  visual: z.object({
    type: z.enum(["none", "table"]),
    headers: z.array(z.string()).optional(),
    rows: z
      .array(z.array(z.union([z.string(), z.number()])))
      .optional(),
  }),
  source_note: z.string().optional(),
});

export const questionWriterOutputSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(2).max(3),
});

export const distractorOutputSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(2).max(3),
});

export const mebComplianceOutputSchema = z.object({
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  issues: z.array(z.string()),
  checklist: z.record(z.string(), z.boolean()),
  revision_notes: z.string().optional(),
});

export type ContextDesignerOutput = z.infer<typeof contextDesignerOutputSchema>;
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;
export type QuestionWriterOutput = z.infer<typeof questionWriterOutputSchema>;
export type MebComplianceOutput = z.infer<typeof mebComplianceOutputSchema>;

const FORBIDDEN_OPTION = /hepsi|hiçbiri|yukarıdakilerin/i;

export function assertNoForbiddenOptions(
  questions: GeneratedQuestion[],
): string[] {
  const errors: string[] = [];
  for (const q of questions) {
    for (const text of Object.values(q.options)) {
      if (FORBIDDEN_OPTION.test(text)) {
        errors.push(`Yasak şık ifadesi: "${text}"`);
      }
    }
    if (FORBIDDEN_OPTION.test(q.stem)) {
      errors.push("Soru kökünde yasak ifade");
    }
  }
  return errors;
}

export function optionLengthImbalance(
  questions: GeneratedQuestion[],
): boolean {
  for (const q of questions) {
    const lengths = Object.values(q.options).map((t) => t.length);
    const max = Math.max(...lengths);
    const min = Math.min(...lengths);
    if (max - min > 40) return true;
  }
  return false;
}
