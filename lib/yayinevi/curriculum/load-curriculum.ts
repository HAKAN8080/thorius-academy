import tema1 from "./grade-8-matematik-tema-1.json";
import type { CurriculumThemeSeed, LearningOutcomeSeed } from "./types";

export function loadGrade8MatematikTema1(): CurriculumThemeSeed {
  return tema1 as CurriculumThemeSeed;
}

export function findOutcomeByCode(
  code: string,
): LearningOutcomeSeed | undefined {
  const theme = loadGrade8MatematikTema1();
  return theme.outcomes.find((o) => o.code === code);
}

export function getActiveOutcomes(): LearningOutcomeSeed[] {
  return loadGrade8MatematikTema1().outcomes;
}
