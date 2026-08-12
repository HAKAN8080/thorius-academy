import { readFile } from "node:fs/promises";
import path from "node:path";
import * as React from "react";

export const OG_CARD_SIZE = { width: 1200, height: 630 } as const;

export const OG_BRAND = {
  navy: "#020610",
  navyMid: "#05101f",
  gold: "#D4AF37",
  goldSoft: "rgba(212,175,55,0.9)",
  white: "#ffffff",
  muted: "rgba(255,255,255,0.82)",
  overlayTop: "rgba(2, 6, 16, 0.72)",
  overlayBottom: "rgba(2, 6, 16, 0.94)",
} as const;

export const DEFAULT_OG_BACKGROUND = "/images/hero-visual.jpg";

export async function loadOgBackgroundSrc(
  imageUrl: string | null | undefined,
): Promise<string> {
  const candidates = [imageUrl, DEFAULT_OG_BACKGROUND].filter(
    (value): value is string => Boolean(value?.trim()),
  );

  for (const candidate of candidates) {
    const loaded = await loadImageDataUri(candidate);
    if (loaded) {
      return loaded;
    }
  }

  return buildFallbackGradientDataUri();
}

async function loadImageDataUri(source: string): Promise<string | null> {
  try {
    if (source.startsWith("/")) {
      const filePath = path.join(process.cwd(), "public", source);
      const buffer = await readFile(filePath);
      const mime = source.endsWith(".png")
        ? "image/png"
        : source.endsWith(".webp")
          ? "image/webp"
          : "image/jpeg";
      return `data:${mime};base64,${buffer.toString("base64")}`;
    }

    const response = await fetch(source, {
      cache: "force-cache",
      signal: AbortSignal.timeout(2500),
    });
    if (!response.ok) {
      return null;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType =
      response.headers.get("content-type")?.split(";")[0] ?? "image/jpeg";
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch {
    return null;
  }
}

function buildFallbackGradientDataUri(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#05101f"/>
        <stop offset="100%" style="stop-color:#020610"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#g)"/>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function ThoriusWordmark({
  size = "lg",
}: {
  size?: "lg" | "md";
}): React.ReactElement {
  const fontSize = size === "lg" ? 46 : 38;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize,
        fontWeight: 900,
        color: OG_BRAND.white,
        letterSpacing: -2,
        textShadow: "0 2px 18px rgba(0,0,0,0.45)",
      }}
    >
      THORIUS
      <span style={{ color: OG_BRAND.gold, marginLeft: 4 }}>.</span>
    </div>
  );
}

export function OgCardFrame({
  backgroundSrc,
  children,
}: {
  backgroundSrc: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        fontFamily: "system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}
    >
      <img
        src={backgroundSrc}
        alt=""
        width={OG_CARD_SIZE.width}
        height={OG_CARD_SIZE.height}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(180deg, rgba(2,6,16,0.62) 0%, rgba(2,6,16,0.18) 42%, rgba(2,6,16,0.88) 100%)",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "52px 60px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function OgDomainFooter({
  leftText,
}: {
  leftText?: string;
}): React.ReactElement {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        fontSize: 20,
        color: OG_BRAND.goldSoft,
        fontWeight: 600,
      }}
    >
      <span>{leftText ?? "Perakendenin Yeni Nesil Akademisi"}</span>
      <span>academy.thorius.com.tr</span>
    </div>
  );
}
