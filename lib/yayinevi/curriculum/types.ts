export interface ProcessComponentSeed {
  letter: string;
  description: string;
}

export interface LearningOutcomeSeed {
  code: string;
  title: string;
  contentFramework: string[];
  contextHints: string[];
  keyConcepts: string[];
  processComponents: ProcessComponentSeed[];
}

export interface CurriculumThemeSeed {
  grade: number;
  subject: string;
  themeNumber: number;
  title: string;
  tymmUnitUrl: string;
  areaSkills: string[];
  conceptualSkills: string[];
  outcomes: LearningOutcomeSeed[];
}
