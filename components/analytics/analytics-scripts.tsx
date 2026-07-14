import Script from "next/script";
import { MetaPixel } from "@/components/analytics/meta-pixel";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() || "";

/**
 * GA4 and Meta Pixel scripts. Both require NEXT_PUBLIC_* env at build/redeploy time.
 */
export function AnalyticsScripts() {
  return (
    <>
      {GA_ID ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
        </>
      ) : null}
      <MetaPixel />
    </>
  );
}
