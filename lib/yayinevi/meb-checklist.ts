import type { GeneratedQuestion } from "@/lib/yayinevi/validate-generation";
import {
  assertNoForbiddenOptions,
  optionLengthImbalance,
} from "@/lib/yayinevi/validate-generation";

export interface MebChecklistItem {
  id: string;
  label: string;
  auto?: boolean;
}

export const MEB_CHECKLIST_ITEMS: MebChecklistItem[] = [
  { id: "context_age", label: "Bağlam öğrenci yaş düzeyine uygun", auto: true },
  { id: "context_daily", label: "Bağlam günlük hayatla ilişkili", auto: true },
  { id: "context_functional", label: "Bağlam işlevsel (dekor değil)", auto: true },
  { id: "context_clear", label: "Bağlam gereksiz detaydan arındırılmış", auto: true },
  { id: "stem_clear", label: "Soru kökü açık ve anlaşılır", auto: true },
  { id: "options_balanced", label: "Şık uzunlukları dengeli", auto: true },
  { id: "distractors_strong", label: "Çeldiriciler kavram yanılgısı temelli", auto: false },
  { id: "no_hepsi_hicbiri", label: "Hepsi/Hiçbiri şıkkı yok", auto: true },
  { id: "no_hint", label: "İpucu veren ifade yok", auto: false },
  { id: "visual_required", label: "Görsel çözüm için gerekli", auto: false },
  { id: "ethical", label: "Etik ve tarafsız", auto: false },
  { id: "grammar", label: "Dil ve noktalama uygun", auto: false },
];

export interface AutomaticCheckResult {
  checklist: Record<string, boolean>;
  issues: string[];
  score: number;
}

export function runAutomaticMebChecks(input: {
  contextBody: string;
  questions: GeneratedQuestion[];
  hasFunctionalVisual: boolean;
}): AutomaticCheckResult {
  const checklist: Record<string, boolean> = {};
  const issues: string[] = [];

  checklist.context_age = input.contextBody.length >= 80;
  checklist.context_daily = true;
  checklist.context_functional = input.contextBody.length >= 80;
  checklist.context_clear = input.contextBody.length < 1200;
  checklist.stem_clear = input.questions.every((q) => q.stem.length >= 15);
  checklist.options_balanced = !optionLengthImbalance(input.questions);

  const forbidden = assertNoForbiddenOptions(input.questions);
  checklist.no_hepsi_hicbiri = forbidden.length === 0;
  if (forbidden.length > 0) issues.push(...forbidden);

  checklist.visual_required = input.hasFunctionalVisual;
  checklist.distractors_strong = input.questions.every(
    (q) => Object.keys(q.distractors ?? {}).length >= 2,
  );
  checklist.no_hint = true;
  checklist.ethical = true;
  checklist.grammar = true;

  const autoItems = MEB_CHECKLIST_ITEMS.filter((i) => i.auto);
  const passedAuto = autoItems.filter((i) => checklist[i.id]).length;
  const score = Math.round((passedAuto / autoItems.length) * 100);

  if (!checklist.options_balanced) {
    issues.push("Şık uzunlukları dengesiz");
  }
  if (!checklist.visual_required) {
    issues.push("İşlevsel görsel eksik veya zayıf");
  }

  return { checklist, issues, score };
}
