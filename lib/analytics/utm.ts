const UTM_STORAGE_KEY = "thorius_utm_v1";

export const ATTRIBUTION_QUERY_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "fbclid",
] as const;

export type AttributionKey = (typeof ATTRIBUTION_QUERY_KEYS)[number];
export type AttributionParams = Partial<Record<AttributionKey, string>>;

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

export function readAttributionFromSearch(
  search: string | URLSearchParams,
): AttributionParams {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const out: AttributionParams = {};

  for (const key of ATTRIBUTION_QUERY_KEYS) {
    const value = params.get(key)?.trim();
    if (value) {
      out[key] = value;
    }
  }

  return out;
}

export function mergeAttribution(
  current: AttributionParams,
  incoming: AttributionParams,
): AttributionParams {
  return { ...current, ...incoming };
}

export function captureAttributionFromLocation(): AttributionParams {
  if (!canUseSessionStorage()) {
    return {};
  }

  const incoming = readAttributionFromSearch(window.location.search);
  if (Object.keys(incoming).length === 0) {
    return getStoredAttribution();
  }

  const merged = mergeAttribution(getStoredAttribution(), incoming);
  sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(merged));
  return merged;
}

export function getStoredAttribution(): AttributionParams {
  if (!canUseSessionStorage()) {
    return {};
  }

  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw) as AttributionParams;
    if (!parsed || typeof parsed !== "object") {
      return {};
    }
    const out: AttributionParams = {};
    for (const key of ATTRIBUTION_QUERY_KEYS) {
      const value = parsed[key];
      if (typeof value === "string" && value.trim()) {
        out[key] = value.trim();
      }
    }
    return out;
  } catch {
    return {};
  }
}

/** Append stored (or provided) attribution params onto a URL string. */
export function appendAttributionToUrl(
  url: string,
  attribution: AttributionParams = getStoredAttribution(),
): string {
  try {
    const parsed = new URL(url);
    for (const key of ATTRIBUTION_QUERY_KEYS) {
      const value = attribution[key];
      if (value && !parsed.searchParams.has(key)) {
        parsed.searchParams.set(key, value);
      }
    }
    return parsed.toString();
  } catch {
    return url;
  }
}
