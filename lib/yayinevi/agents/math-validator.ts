import type { GeneratedQuestion } from "@/lib/yayinevi/validate-generation";

export interface MathValidationResult {
  passed: boolean;
  issues: string[];
}

/** Faz 1: yapısal doğrulama; sembolik CAS yok */
export function runMathValidatorAgent(
  questions: GeneratedQuestion[],
): MathValidationResult {
  const issues: string[] = [];

  questions.forEach((q, index) => {
    if (!q.options[q.correct]) {
      issues.push(`Soru ${index + 1}: doğru şık anahtarı geçersiz`);
    }
    const uniqueOptions = new Set(Object.values(q.options));
    if (uniqueOptions.size < 4) {
      issues.push(`Soru ${index + 1}: şıklar yeterince farklı değil`);
    }
    if (q.solution.length < 20) {
      issues.push(`Soru ${index + 1}: çözüm çok kısa`);
    }
  });

  return { passed: issues.length === 0, issues };
}
