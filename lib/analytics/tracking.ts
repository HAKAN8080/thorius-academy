type GtagFn = (...args: unknown[]) => void;
type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    fbq?: FbqFn;
    dataLayer?: unknown[];
  }
}

export interface TrackingItem {
  id?: string;
  name: string;
  price?: number | null;
  currency?: string;
}

function toPrice(value: number | null | undefined): number | undefined {
  if (value == null || Number.isNaN(value)) {
    return undefined;
  }
  return Math.round(value * 100) / 100;
}

/** GA4 begin_checkout + Meta InitiateCheckout */
export function trackBeginCheckout(item: TrackingItem): void {
  if (typeof window === "undefined") {
    return;
  }

  const price = toPrice(item.price);
  const currency = item.currency ?? "TRY";

  window.gtag?.("event", "begin_checkout", {
    currency,
    value: price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price,
        quantity: 1,
      },
    ],
  });

  window.fbq?.("track", "InitiateCheckout", {
    content_name: item.name,
    content_ids: item.id ? [item.id] : undefined,
    content_type: "product",
    value: price,
    currency,
  });
}

/** GA4 view_item + Meta ViewContent */
export function trackViewContent(item: TrackingItem): void {
  if (typeof window === "undefined") {
    return;
  }

  const price = toPrice(item.price);
  const currency = item.currency ?? "TRY";

  window.gtag?.("event", "view_item", {
    currency,
    value: price,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price,
        quantity: 1,
      },
    ],
  });

  window.fbq?.("track", "ViewContent", {
    content_name: item.name,
    content_ids: item.id ? [item.id] : undefined,
    content_type: "product",
    value: price,
    currency,
  });
}
