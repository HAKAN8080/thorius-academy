export type CareerPathStepStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed";

export interface DbCareerPath {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  hero_eyebrow: string;
  outcomes: string[];
  milestones: Array<{ label: string; description: string; href?: string }>;
  catalog_href: string;
  catalog_label: string;
  closing_title: string;
  closing_description: string;
  is_published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbCareerPathStep {
  id: string;
  career_path_id: string;
  step_order: number;
  level: string;
  label: string;
  course_slug: string;
  fallback_title: string;
  description: string;
}

export interface CareerPathStepWithStatus extends DbCareerPathStep {
  status: CareerPathStepStatus;
  progressPercent: number;
  courseTitle: string | null;
}

export interface CareerPathWithProgress extends DbCareerPath {
  steps: CareerPathStepWithStatus[];
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  isEnrolled: boolean;
}

export interface CareerPathAdminInput {
  slug: string;
  title: string;
  subtitle: string;
  heroEyebrow: string;
  outcomes: string[];
  catalogHref: string;
  catalogLabel: string;
  closingTitle: string;
  closingDescription: string;
  isPublished: boolean;
  sortOrder: number;
  steps: Array<{
    stepOrder: number;
    level: string;
    label: string;
    courseSlug: string;
    fallbackTitle: string;
    description: string;
  }>;
}
