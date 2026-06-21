import { cache } from "react";
import { resolveAllCategoryCoverImages } from "@/lib/course/resolve-category-cover-image";
import { fetchCategoryList } from "@/lib/wordpress/api";
import { getAcademyHomeCatalog } from "@/lib/wordpress/academy-home-catalog";

/** Kategori grid — kurs kataloğu beklemeden, slug başına cache'li kapak. */
export const getHomepageCategories = cache(async () => {
  const categories = await fetchCategoryList();
  return resolveAllCategoryCoverImages(categories);
});

/** Hero + vitrin — kurs listesi, fiyat ve istatistikler. */
export const getHomepageCatalog = cache(getAcademyHomeCatalog);
