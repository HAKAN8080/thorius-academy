import { CategoryGrid } from "@/components/marketing/category-grid";
import { getHomepageCategories } from "@/lib/wordpress/homepage-data";

export async function HomeCategorySection() {
  const categories = await getHomepageCategories();
  return <CategoryGrid categories={categories} />;
}
