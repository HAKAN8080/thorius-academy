const SLUG_VARIANT_CACHE = new Map<string, string[]>();

export function getCourseSlugLookupVariants(slug: string): string[] {
  const cached = SLUG_VARIANT_CACHE.get(slug);
  if (cached) {
    return cached;
  }

  const variants = new Set<string>([slug]);

  try {
    const decoded = decodeURIComponent(slug);
    variants.add(decoded);
    variants.add(encodeURIComponent(decoded));
  } catch {
    // keep original slug only
  }

  const normalized = Array.from(variants);
  SLUG_VARIANT_CACHE.set(slug, normalized);
  return normalized;
}
