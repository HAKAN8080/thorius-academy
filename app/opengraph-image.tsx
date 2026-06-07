import { renderSiteOgImage } from "@/lib/seo/site-og-image";
import { OG_CARD_SIZE } from "@/lib/seo/og-card";

export const runtime = "nodejs";
export const size = OG_CARD_SIZE;
export const contentType = "image/png";
export const alt = "Thorius Academy - Perakendenin Yeni Nesil Akademisi";

export default async function OGImage() {
  return renderSiteOgImage();
}
