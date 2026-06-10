import { stripMarkdown } from "@/lib/markdown/to-html";

export interface CourseSeoFields {
  seo_title: string;
  seo_description: string;
  seo_focus_keyword: string;
}

export function buildCourseSeoDefaults(input: {
  title: string;
  subtitle?: string | null;
  description_md?: string | null;
  category?: string | null;
}): CourseSeoFields {
  const title = input.title.trim();
  const subtitle = input.subtitle?.trim() ?? "";
  const plainDescription = stripMarkdown(input.description_md);
  const category = input.category?.trim() ?? "";

  const seo_title = title ? `${title} | Thorius Academy` : "Thorius Academy";
  const seo_description =
    subtitle ||
    plainDescription.slice(0, 160) ||
    `${title} eğitimini Thorius Academy'de keşfedin.`;

  const focusParts = [category, ...title.split(/\s+/).slice(0, 4)]
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    seo_title: seo_title.slice(0, 60),
    seo_description: seo_description.slice(0, 160),
    seo_focus_keyword: focusParts.slice(0, 3).join(", ").slice(0, 80),
  };
}
