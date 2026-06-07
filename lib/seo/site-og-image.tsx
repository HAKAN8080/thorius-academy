import { ImageResponse } from "next/og";
import {
  loadOgBackgroundSrc,
  OG_CARD_SIZE,
  OgCardFrame,
  OgDomainFooter,
  ThoriusWordmark,
} from "@/lib/seo/og-card";

export async function renderSiteOgImage(): Promise<ImageResponse> {
  const backgroundSrc = await loadOgBackgroundSrc(null);

  return new ImageResponse(
    (
      <OgCardFrame backgroundSrc={backgroundSrc}>
        <ThoriusWordmark size="lg" />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.12,
              letterSpacing: -1.5,
              textShadow: "0 2px 20px rgba(0,0,0,0.35)",
            }}
          >
            Perakendenin Yeni Nesil Akademisi
          </div>
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.86)",
              lineHeight: 1.45,
              maxWidth: 820,
            }}
          >
            Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş premium
            eğitim deneyimi
          </div>
        </div>

        <OgDomainFooter />
      </OgCardFrame>
    ),
    { ...OG_CARD_SIZE },
  );
}
