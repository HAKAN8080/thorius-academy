import { cache } from "react";
import { resolveAllCategoryCoverImages } from "@/lib/course/resolve-category-cover-image";
import { getCourseCatalog } from "@/lib/wordpress/catalog";

/** Ana sayfa — tek kaynak: tam WP katalog (1 saat cache) + kategori kapakları. */
export const getHomepageCatalog = cache(async () => {
  const catalog = await getCourseCatalog();
  const categories = await resolveAllCategoryCoverImages(catalog.categories);

  return {
    ...catalog,
    categories,
  };
});
