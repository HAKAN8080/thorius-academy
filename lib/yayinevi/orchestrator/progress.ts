import { readFile, writeFile } from "fs/promises";
import path from "path";
import { findOutcomeByCode } from "@/lib/yayinevi/curriculum/load-curriculum";

export interface TemaProgress {
  theme: string;
  tymmUnitUrl: string;
  targetQuestions: number;
  approvedQuestions: number;
  pendingHumanReview: number;
  outcomes: Record<
    string,
    {
      title: string;
      processComponents: Record<
        string,
        { setsApproved: number; setsPending: number; targetSets: number }
      >;
    }
  >;
  nextAction: string;
  nextTarget: {
    outcomeCode: string;
    processComponentLetter: string;
    difficulty: string;
    contextTheme?: string;
  };
  pipelineVersion: string;
  lastUpdated: string | null;
}

const PROGRESS_PATH = path.join(
  process.cwd(),
  "planning/yayinevi/tema-1-progress.json",
);

export async function loadTemaProgress(): Promise<TemaProgress> {
  const raw = await readFile(PROGRESS_PATH, "utf8");
  return JSON.parse(raw) as TemaProgress;
}

export async function saveTemaProgress(progress: TemaProgress): Promise<void> {
  progress.lastUpdated = new Date().toISOString();
  await writeFile(PROGRESS_PATH, `${JSON.stringify(progress, null, 2)}\n`, "utf8");
}

export function resolvePipelineTarget(input: {
  outcomeCode?: string;
  processComponentLetter?: string;
  difficulty?: string;
  contextTheme?: string;
  progress?: TemaProgress;
}): {
  outcomeCode: string;
  processComponentLetter: string;
  difficulty: string;
  contextTheme?: string;
  outcomeTitle: string;
  processComponentDescription: string;
  contextHints: string[];
} {
  const outcomeCode =
    input.outcomeCode ??
    input.progress?.nextTarget.outcomeCode ??
    "MAT.8.1.1";
  const processComponentLetter =
    input.processComponentLetter ??
    input.progress?.nextTarget.processComponentLetter ??
    "c";
  const difficulty =
    input.difficulty ?? input.progress?.nextTarget.difficulty ?? "orta";

  const outcome = findOutcomeByCode(outcomeCode);
  if (!outcome) {
    throw new Error(`Öğrenme çıktısı bulunamadı: ${outcomeCode}`);
  }

  const component = outcome.processComponents.find(
    (c) => c.letter === processComponentLetter,
  );
  if (!component) {
    throw new Error(
      `Süreç bileşeni bulunamadı: ${outcomeCode} / ${processComponentLetter}`,
    );
  }

  return {
    outcomeCode,
    processComponentLetter,
    difficulty,
    contextTheme: input.contextTheme ?? input.progress?.nextTarget.contextTheme,
    outcomeTitle: outcome.title,
    processComponentDescription: component.description,
    contextHints: outcome.contextHints,
  };
}
