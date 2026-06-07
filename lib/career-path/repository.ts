import {
  AI_CAREER_PATH,
  CAREER_PATHS,
  HR_CAREER_PATH,
  RETAIL_PLANNING_PATH,
} from "@/lib/content/career-paths";
import type { CareerPathDefinition } from "@/lib/content/career-path-types";
import type { DbCareerPath, DbCareerPathStep } from "@/lib/career-path/types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const SHARED_MILESTONES = [
  {
    label: "Sertifika",
    description:
      "Her kursu tamamladığınızda dijital katılım belgesi; yolu bitirdiğinizde uzmanlık portföyü.",
  },
  {
    label: "Thorius Coaching",
    description: "CV, mülakat ve kariyer hedefi için bire bir koçluk desteği.",
    href: "/#ecosystem",
  },
  {
    label: "Kurumsal mentorluk",
    description: "Ekip bazlı öğrenme paketleri ve şirket içi uygulama desteği.",
    href: "/kurumsal",
  },
];

function mapStaticPath(path: CareerPathDefinition): DbCareerPath {
  return {
    id: `static-${path.slug}`,
    slug: path.slug,
    title: path.title,
    subtitle: path.subtitle,
    hero_eyebrow: path.heroEyebrow,
    outcomes: [...path.outcomes],
    milestones: path.milestones.map((item) => ({ ...item })),
    catalog_href: path.catalogHref,
    catalog_label: path.catalogLabel,
    closing_title: path.closingTitle,
    closing_description: path.closingDescription,
    is_published: true,
    sort_order:
      path.slug === "retail-planning"
        ? 1
        : path.slug === "insan-kaynaklari"
          ? 2
          : 3,
    created_at: new Date(0).toISOString(),
    updated_at: new Date(0).toISOString(),
  };
}

function mapStaticSteps(path: CareerPathDefinition): DbCareerPathStep[] {
  return path.steps.map((step, index) => ({
    id: `static-${path.slug}-${index + 1}`,
    career_path_id: `static-${path.slug}`,
    step_order: index + 1,
    level: step.level,
    label: step.label,
    course_slug: step.slug,
    fallback_title: step.fallbackTitle,
    description: step.description,
  }));
}

function staticPathBySlug(slug: string): CareerPathDefinition | undefined {
  if (slug === RETAIL_PLANNING_PATH.slug) return RETAIL_PLANNING_PATH;
  if (slug === HR_CAREER_PATH.slug) return HR_CAREER_PATH;
  if (slug === AI_CAREER_PATH.slug) return AI_CAREER_PATH;
  return CAREER_PATHS.find((path) => path.slug === slug);
}

function parseOutcomes(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function parseMilestones(
  value: unknown,
): DbCareerPath["milestones"] {
  if (!Array.isArray(value) || value.length === 0) {
    return SHARED_MILESTONES.map((item) => ({ ...item }));
  }

  return value
    .filter(
      (item): item is { label: string; description: string; href?: string } =>
        typeof item === "object" &&
        item !== null &&
        "label" in item &&
        "description" in item &&
        typeof (item as { label: unknown }).label === "string" &&
        typeof (item as { description: unknown }).description === "string",
    )
    .map((item) => ({ ...item }));
}

function isMissingTableError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("career_paths") &&
    (lower.includes("does not exist") ||
      lower.includes("could not find") ||
      lower.includes("schema cache"))
  );
}

async function getCareerPathReadClient(options?: {
  includeUnpublished?: boolean;
}): Promise<ReturnType<typeof getSupabaseAdmin>> {
  if (!options?.includeUnpublished) {
    return (await createClient()) as ReturnType<typeof getSupabaseAdmin>;
  }

  try {
    return getSupabaseAdmin();
  } catch (error) {
    console.error(
      "[Career Paths] Admin client unavailable, falling back to session client:",
      error,
    );
    return (await createClient()) as ReturnType<typeof getSupabaseAdmin>;
  }
}

export async function listCareerPathsFromDb(options?: {
  includeUnpublished?: boolean;
}): Promise<DbCareerPath[]> {
  const useStaticFallback = !options?.includeUnpublished;

  try {
    const client = await getCareerPathReadClient(options);

    let query = client
      .from("career_paths")
      .select("*")
      .order("sort_order", { ascending: true });

    if (!options?.includeUnpublished) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    if (error) {
      if (useStaticFallback && isMissingTableError(error.message)) {
        return CAREER_PATHS.map(mapStaticPath);
      }
      throw error;
    }

    if (data?.length) {
      return data.map((row) => ({
        ...(row as DbCareerPath),
        outcomes: parseOutcomes((row as DbCareerPath).outcomes),
        milestones: parseMilestones((row as DbCareerPath).milestones),
      }));
    }

    if (options?.includeUnpublished) {
      const sessionClient = await createClient();
      const { data: published, error: publishedError } = await sessionClient
        .from("career_paths")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true });

      if (!publishedError && published?.length) {
        return published.map((row) => ({
          ...(row as DbCareerPath),
          outcomes: parseOutcomes((row as DbCareerPath).outcomes),
          milestones: parseMilestones((row as DbCareerPath).milestones),
        }));
      }
    }

    return useStaticFallback ? CAREER_PATHS.map(mapStaticPath) : [];
  } catch (error) {
    console.error("[Career Paths] listCareerPathsFromDb failed:", error);

    if (options?.includeUnpublished) {
      try {
        const sessionClient = await createClient();
        const { data: published } = await sessionClient
          .from("career_paths")
          .select("*")
          .eq("is_published", true)
          .order("sort_order", { ascending: true });

        if (published?.length) {
          return published.map((row) => ({
            ...(row as DbCareerPath),
            outcomes: parseOutcomes((row as DbCareerPath).outcomes),
            milestones: parseMilestones((row as DbCareerPath).milestones),
          }));
        }
      } catch (retryError) {
        console.error("[Career Paths] Published retry failed:", retryError);
      }
    }

    return useStaticFallback ? CAREER_PATHS.map(mapStaticPath) : [];
  }
}

export async function getCareerPathBySlugFromDb(
  slug: string,
  options?: { includeUnpublished?: boolean },
): Promise<DbCareerPath | null> {
  const paths = await listCareerPathsFromDb(options);
  return paths.find((path) => path.slug === slug) ?? null;
}

export async function listCareerPathStepsFromDb(
  careerPathId: string,
  pathSlug?: string,
): Promise<DbCareerPathStep[]> {
  if (careerPathId.startsWith("static-") && pathSlug) {
    const staticPath = staticPathBySlug(pathSlug);
    return staticPath ? mapStaticSteps(staticPath) : [];
  }

  try {
    const client = await createClient();
    const { data, error } = await client
      .from("career_path_steps")
      .select("*")
      .eq("career_path_id", careerPathId)
      .order("step_order", { ascending: true });

    if (error) {
      if (isMissingTableError(error.message) && pathSlug) {
        const staticPath = staticPathBySlug(pathSlug);
        return staticPath ? mapStaticSteps(staticPath) : [];
      }
      throw error;
    }

    return (data ?? []) as DbCareerPathStep[];
  } catch {
    if (!pathSlug) {
      return [];
    }
    const staticPath = staticPathBySlug(pathSlug);
    return staticPath ? mapStaticSteps(staticPath) : [];
  }
}

const CAREER_PATH_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getCareerPathAdminById(
  idOrSlug: string,
): Promise<{ path: DbCareerPath; steps: DbCareerPathStep[] } | null> {
  try {
    const admin = getSupabaseAdmin();
    const isUuid = CAREER_PATH_UUID_PATTERN.test(idOrSlug);

    let pathQuery = admin.from("career_paths").select("*");
    pathQuery = isUuid
      ? pathQuery.eq("id", idOrSlug)
      : pathQuery.eq("slug", idOrSlug);

    const { data: path, error } = await pathQuery.maybeSingle();

    if (error) {
      console.error("[Career Path Admin] Load path error:", error);
      return null;
    }

    if (!path) {
      return null;
    }

    const careerPathId = (path as DbCareerPath).id;
    const { data: steps, error: stepsError } = await admin
      .from("career_path_steps")
      .select("*")
      .eq("career_path_id", careerPathId)
      .order("step_order", { ascending: true });

    if (stepsError) {
      console.error("[Career Path Admin] Load steps error:", stepsError);
      return null;
    }

    return {
      path: {
        ...(path as DbCareerPath),
        outcomes: parseOutcomes((path as DbCareerPath).outcomes),
        milestones: SHARED_MILESTONES,
      },
      steps: (steps ?? []) as DbCareerPathStep[],
    };
  } catch (error) {
    console.error("[Career Path Admin] Load failed:", error);
    return null;
  }
}

export function toCareerPathDefinition(
  path: DbCareerPath,
  steps: DbCareerPathStep[],
): CareerPathDefinition {
  return {
    slug: path.slug,
    title: path.title,
    subtitle: path.subtitle,
    heroEyebrow: path.hero_eyebrow,
    outcomes: path.outcomes,
    steps: steps.map((step) => ({
      level: step.level,
      label: step.label,
      slug: step.course_slug,
      fallbackTitle: step.fallback_title || step.label,
      description: step.description,
    })),
    milestones:
      path.milestones.length > 0 ? path.milestones : SHARED_MILESTONES,
    catalogHref: path.catalog_href,
    catalogLabel: path.catalog_label,
    closingTitle: path.closing_title,
    closingDescription: path.closing_description,
  };
}
