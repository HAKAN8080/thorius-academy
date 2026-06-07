import {
  AI_CAREER_PATH,
  HR_CAREER_PATH,
  RETAIL_PLANNING_PATH,
} from "@/lib/content/career-paths";
import type { CareerPathDefinition } from "@/lib/content/career-path-types";
import {
  getCareerPathBySlugFromDb,
  listCareerPathStepsFromDb,
  toCareerPathDefinition,
} from "@/lib/career-path/repository";
import {
  loadCareerPathPage,
  type CareerPathPageData,
} from "@/lib/course/load-career-path-page";

const STATIC_FALLBACKS: Record<string, CareerPathDefinition> = {
  "retail-planning": RETAIL_PLANNING_PATH,
  "insan-kaynaklari": HR_CAREER_PATH,
  "yapay-zeka": AI_CAREER_PATH,
};

export async function loadCareerPathBySlug(
  slug: string,
  staticFallback?: CareerPathDefinition,
): Promise<CareerPathPageData | null> {
  const dbPath = await getCareerPathBySlugFromDb(slug);
  if (dbPath) {
    const steps = await listCareerPathStepsFromDb(dbPath.id, dbPath.slug);
    const path = toCareerPathDefinition(dbPath, steps);
    return loadCareerPathPage(path);
  }

  const fallback = staticFallback ?? STATIC_FALLBACKS[slug];
  if (!fallback) {
    return null;
  }

  return loadCareerPathPage(fallback);
}
