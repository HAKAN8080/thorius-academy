import { headers } from "next/headers";
import Script from "next/script";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { UtmCapture } from "@/components/analytics/utm-capture";
import { getSiteModeFromHost } from "@/lib/site/site-mode";

function resolveGaMeasurementId(siteMode: string): string {
  if (siteMode === "kitaplik") {
    return (
      process.env.NEXT_PUBLIC_KITAPLIK_GA_ID?.trim() ||
      process.env.NEXT_PUBLIC_GA_ID?.trim() ||
      ""
    );
  }

  return process.env.NEXT_PUBLIC_GA_ID?.trim() || "";
}

/**
 * GA4 and Meta Pixel scripts. NEXT_PUBLIC_* IDs are inlined at build/redeploy.
 * Kitaplik uses NEXT_PUBLIC_KITAPLIK_GA_ID when set; other modes use NEXT_PUBLIC_GA_ID.
 */
export function AnalyticsScripts() {
  const host = headers().get("host");
  const siteMode = getSiteModeFromHost(host);
  const gaId = resolveGaMeasurementId(siteMode);

  return (
    <>
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id={`ga4-init-${siteMode}`} strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}
      <MetaPixel />
      <UtmCapture />
    </>
  );
}
