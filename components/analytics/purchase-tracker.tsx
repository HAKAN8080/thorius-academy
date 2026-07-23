"use client";

import { useEffect, useRef } from "react";
import { trackPurchase } from "@/lib/analytics/tracking";

interface PurchaseTrackerProps {
  orderId: string;
  value: number | null;
  currency?: string;
  contentIds?: string[];
  contentName?: string;
}

/**
 * Fires GA4/Meta Purchase once per order_id (sessionStorage dedupe).
 */
export function PurchaseTracker({
  orderId,
  value,
  currency = "TRY",
  contentIds = [],
  contentName,
}: PurchaseTrackerProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!orderId || firedRef.current) {
      return;
    }

    const storageKey = `thorius_purchase_${orderId}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") {
        return;
      }
    } catch {
      // private mode — still attempt once via ref
    }

    const numericValue = value != null && !Number.isNaN(value) ? value : 0;
    const ids = contentIds.filter(Boolean);
    const items =
      ids.length > 0
        ? ids.map((id, index) => ({
            id,
            name:
              index === 0 && contentName?.trim()
                ? contentName.trim()
                : `product_${id}`,
            price: index === 0 ? numericValue : undefined,
            currency,
          }))
        : [
            {
              id: orderId,
              name: contentName?.trim() || `order_${orderId}`,
              price: numericValue,
              currency,
            },
          ];

    trackPurchase({
      transactionId: orderId,
      value: numericValue,
      currency,
      items,
    });

    firedRef.current = true;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch {
      // ignore
    }
  }, [orderId, value, currency, contentIds, contentName]);

  return null;
}
