import { cache } from "react";
import {
  getHomepageCatalogFromCache,
  getRecentlyAddedHomepageCoursesFromCache,
} from "@/lib/course/homepage-catalog";

/** Ana sayfa — Supabase courses_cache (1 saat cache), WordPress REST yok. */
export const getHomepageCatalog = cache(getHomepageCatalogFromCache);
export const getRecentlyAddedHomepageCourses = cache(
  getRecentlyAddedHomepageCoursesFromCache,
);
