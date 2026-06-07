export interface CareerPathStep {
  level: string;
  label: string;
  slug: string;
  fallbackTitle: string;
  description: string;
}

export interface CareerPathMilestone {
  label: string;
  description: string;
  href?: string;
}

export interface CareerPathDefinition {
  slug: string;
  title: string;
  subtitle: string;
  heroEyebrow: string;
  outcomes: readonly string[];
  steps: CareerPathStep[];
  milestones: CareerPathMilestone[];
  catalogHref: string;
  catalogLabel: string;
  closingTitle: string;
  closingDescription: string;
}

export interface CareerPathSummary {
  slug: string;
  title: string;
  description: string;
  highlight: string;
  href: string;
}
