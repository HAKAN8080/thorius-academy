/**
 * Offline validation smoke test (no OpenAI).
 * Run: npx tsx scripts/verify-yayinevi-validation.ts
 */
import {
  assertNoForbiddenOptions,
  generatedQuestionSchema,
} from "../lib/yayinevi/validate-generation";
import { runAutomaticMebChecks } from "../lib/yayinevi/meb-checklist";
import { renderTableSvg } from "../lib/yayinevi/visual-templates/render-table-svg";

const sampleQuestion = generatedQuestionSchema.parse({
  stem: "Tabloya göre 3. saatte bakteri sayısı kaç olur?",
  options: {
    A: "9",
    B: "27",
    C: "81",
    D: "243",
  },
  correct: "B",
  solution: "Her saat 3 katına çıktığından 3. saatte 27 bakteri vardır.",
  distractors: { A: "üs karışıklığı", C: "yanlış üs", D: "aşırı büyütme" },
});

const forbidden = assertNoForbiddenOptions([
  {
    ...sampleQuestion,
    options: { ...sampleQuestion.options, D: "Hepsi" },
  },
]);
console.assert(forbidden.length > 0, "Yasak şık yakalanmalı");

const checks = runAutomaticMebChecks({
  contextBody: "x".repeat(100),
  questions: [sampleQuestion, sampleQuestion],
  hasFunctionalVisual: true,
});
console.assert(checks.score > 0, "MEB skor üretilmeli");

const svg = renderTableSvg({
  headers: ["Saat", "Bakteri"],
  rows: [[0, 1], [1, 3]],
});
console.assert(svg.includes("<svg"), "SVG üretilmeli");

console.log("verify-yayinevi-validation: OK");
