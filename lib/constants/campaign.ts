/** Üyelik yenileme e-postasında öne çıkarılacak kategori önceliği */
export const MEMBERSHIP_RENEWAL_CATEGORY_SLUGS = [
  "mit-egitimleri",
  "ist",
  "yapay-zeka",
  "veri-bilimi",
  "python",
] as const;

export const MEMBERSHIP_RENEWAL_PROMO_COURSE_LIMIT = 4;

export function getCampaignCourseSlugsOverride(): string[] {
  const raw = process.env.CAMPAIGN_COURSE_SLUGS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((slug) => slug.trim())
    .filter(Boolean);
}
