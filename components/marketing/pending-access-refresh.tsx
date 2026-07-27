"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Empty panel after purchase: soft-refresh while webhook fulfillment catches up.
 */
export function PendingAccessRefresh({
  active,
  orderId,
  maxSeconds = 90,
  intervalMs = 4000,
}: {
  active: boolean;
  orderId?: string;
  maxSeconds?: number;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;

    const started = Date.now();

    async function claimAndRefresh() {
      if (orderId) {
        await fetch("/api/purchase/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        }).catch(() => null);
      }
      router.refresh();
    }

    void claimAndRefresh();

    const tick = setInterval(() => {
      const seconds = Math.floor((Date.now() - started) / 1000);
      setElapsed(seconds);
      if (seconds >= maxSeconds) {
        clearInterval(tick);
        return;
      }
      void claimAndRefresh();
    }, intervalMs);

    return () => clearInterval(tick);
  }, [active, intervalMs, maxSeconds, orderId, router]);

  if (!active) return null;

  const stillWaiting = elapsed < maxSeconds;

  return (
    <p className="mt-3 text-sm text-primary-700" role="status">
      {stillWaiting
        ? `Az önce satın aldıysanız erişim birkaç dakika içinde görünür. Yenileniyor… (${elapsed}s)`
        : "Hâlâ görünmüyorsa birkaç dakika sonra sayfayı yenileyin veya bizimle iletişime geçin."}
    </p>
  );
}
