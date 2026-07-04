import {
  canonicalizeCategorySlug,
  catalogSlugFromWordPressCategory,
  slugifyCategoryName,
} from "@/lib/course/category-slug";
import type { WPCategory } from "@/types/wordpress";

const HOMEPAGE_CATEGORY_PRIORITY = [
  { slug: "planlama", labels: ["planlama"] },
  { slug: "insan-kaynaklari", labels: ["insan kaynakları", "insan kaynaklari"] },
  { slug: "kocluk", labels: ["koçluk", "kocluk"] },
  { slug: "yapay-zeka", labels: ["yapay zeka", "yapay-zeka"] },
  { slug: "tedarik-zinciri", labels: ["tedarik zinciri", "tedarik-zinciri"] },
  { slug: "wellness", labels: ["wellness", "yoga"] },
] as const;

function normalizeCategoryLabel(value: string): string {
  return value.trim().toLocaleLowerCase("tr");
}

function resolveHomepageCategoryPriority(category: WPCategory): number {
  const catalogSlug = canonicalizeCategorySlug(
    catalogSlugFromWordPressCategory(category),
  );
  const wpSlug = canonicalizeCategorySlug(category.slug);
  const nameSlug = slugifyCategoryName(category.name);
  const normalizedName = normalizeCategoryLabel(category.name);

  for (let index = 0; index < HOMEPAGE_CATEGORY_PRIORITY.length; index += 1) {
    const item = HOMEPAGE_CATEGORY_PRIORITY[index];
    if (
      catalogSlug === item.slug ||
      wpSlug === item.slug ||
      nameSlug === item.slug
    ) {
      return index;
    }

    if (
      item.labels.some(
        (label) =>
          normalizedName === label ||
          normalizedName.includes(label) ||
          catalogSlug.includes(label.replace(/\s+/g, "-")),
      )
    ) {
      return index;
    }
  }

  return HOMEPAGE_CATEGORY_PRIORITY.length;
}

export function sortHomepageCategories(categories: WPCategory[]): WPCategory[] {
  return [...categories].sort((left, right) => {
    const leftPriority = resolveHomepageCategoryPriority(left);
    const rightPriority = resolveHomepageCategoryPriority(right);

    if (leftPriority !== rightPriority) {
      return leftPriority - rightPriority;
    }

    return left.name.localeCompare(right.name, "tr");
  });
}
