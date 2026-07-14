declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[];
      loaded?: boolean;
      version?: string;
      push?: (...args: unknown[]) => void;
      getState?: () => { pixels?: Array<{ id?: string | number }> };
    };
    _fbq?: unknown;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID?.trim() ?? "";

/** Install Meta stub + fbevents.js and init pixel once. Safe to call from event handlers. */
export function ensureMetaPixelInitialized(): boolean {
  if (!PIXEL_ID || typeof window === "undefined") {
    return false;
  }

  if (!window.fbq) {
    const fbq = function (...args: unknown[]) {
      const self = fbq as NonNullable<Window["fbq"]>;
      if (self.callMethod) {
        self.callMethod(...args);
      } else {
        (self.queue = self.queue || []).push(args);
      }
    } as NonNullable<Window["fbq"]>;

    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    window.fbq = fbq;
    window._fbq = fbq;

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    const first = document.getElementsByTagName("script")[0];
    first?.parentNode?.insertBefore(script, first);
  }

  const pixels = window.fbq.getState?.()?.pixels ?? [];
  const already = pixels.some((pixel) => String(pixel.id) === PIXEL_ID);
  if (!already) {
    window.fbq("init", PIXEL_ID);
  }

  return true;
}

export function getMetaPixelId(): string {
  return PIXEL_ID;
}
