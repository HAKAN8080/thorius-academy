"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import {
  ensureMetaPixelInitialized,
  getMetaPixelId,
} from "@/lib/analytics/ensure-meta-pixel";

/**
 * Client Meta Pixel bootstrap.
 * NEXT_PUBLIC_META_PIXEL_ID must be set in Vercel and redeployed — empty at build ? no init.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const firstPageView = useRef(true);
  const pixelId = getMetaPixelId();

  useEffect(() => {
    if (!pixelId) {
      console.warn(
        "[meta-pixel] NEXT_PUBLIC_META_PIXEL_ID is empty. Set it in Vercel env and Redeploy.",
      );
      return;
    }

    if (!ensureMetaPixelInitialized()) {
      return;
    }

    window.fbq?.("track", "PageView");
    firstPageView.current = false;
  }, [pixelId]);

  useEffect(() => {
    if (!pixelId || firstPageView.current) {
      return;
    }

    if (!ensureMetaPixelInitialized()) {
      return;
    }

    window.fbq?.("track", "PageView");
  }, [pathname, pixelId]);

  if (!pixelId) {
    return null;
  }

  return (
    <noscript>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
