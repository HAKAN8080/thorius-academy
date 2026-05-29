export function getWpSiteOrigin(): string | null {
  const siteUrl =
    process.env.NEXT_PUBLIC_WP_SITE_URL?.replace(/\/$/, "") ||
    process.env.WP_API_URL?.replace(/\/$/, "");
  if (siteUrl) return siteUrl;

  const wpApi = process.env.NEXT_PUBLIC_WP_API_URL;
  if (wpApi) {
    return wpApi.replace(/\/wp-json\/wp\/v2\/?$/, "");
  }

  return null;
}

export function getCoachingSiteOrigin(): string | null {
  const coachingUrl = process.env.COACHING_SITE_URL?.replace(/\/$/, "");
  if (coachingUrl) return coachingUrl;

  return "https://coaching.thorius.com.tr";
}
