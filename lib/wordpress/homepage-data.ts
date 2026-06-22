import { cache } from "react";
import { getHomepageCatalogFromCache } from "@/lib/course/homepage-catalog";

/** Ana sayfa — Supabase courses_cache (1 saat cache), WordPress REST yok. */
export const getHomepageCatalog = cache(getHomepageCatalogFromCache);
