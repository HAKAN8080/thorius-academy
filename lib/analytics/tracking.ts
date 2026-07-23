import { ensureMetaPixelInitialized } from "@/lib/analytics/ensure-meta-pixel";

type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
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

function trackMeta(event: string, payload: Record<string, unknown>): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureMetaPixelInitialized();
  window.fbq?.("track", event, payload);
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

  trackMeta("InitiateCheckout", {
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

  trackMeta("ViewContent", {
    content_name: item.name,
    content_ids: item.id ? [item.id] : undefined,
    content_type: "product",
    value: price,
    currency,
  });
}

export interface PurchaseTrackingPayload {
  transactionId: string;
  value: number;
  currency?: string;
  items: TrackingItem[];
}

/** GA4 purchase + Meta Purchase (fire once per transactionId). */
export function trackPurchase(payload: PurchaseTrackingPayload): void {
  if (typeof window === "undefined") {
    return;
  }

  const currency = payload.currency ?? "TRY";
  const value = toPrice(payload.value) ?? 0;
  const items = payload.items.map((item) => ({
    item_id: item.id,
    item_name: item.name,
    price: toPrice(item.price),
    quantity: 1,
  }));

  window.gtag?.("event", "purchase", {
    transaction_id: payload.transactionId,
    currency,
    value,
    items,
  });

  const contentIds = payload.items
    .map((item) => item.id)
    .filter((id): id is string => Boolean(id));

  trackMeta("Purchase", {
    content_name: payload.items[0]?.name,
    content_ids: contentIds.length > 0 ? contentIds : undefined,
    content_type: "product",
    value,
    currency,
    num_items: payload.items.length || 1,
  });
}
