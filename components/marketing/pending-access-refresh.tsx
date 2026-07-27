"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Empty panel after purchase: soft-refresh while webhook fulfillment catches up.
 */
export function PendingAccessRefresh({
  active,
  maxSeconds = 90,
  intervalMs = 4000,
}: {
  active: boolean;
  maxSeconds?: number;
  intervalMs?: number;
}) {
  const router = useRouter();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) return;

    const started = Date.now();
    const tick = setInterval(() => {
      const seconds = Math.floor((Date.now() - started) / 1000);
      setElapsed(seconds);
      if (seconds >= maxSeconds) {
        clearInterval(tick);
        return;
      }
      router.refresh();
    }, intervalMs);

    return () => clearInterval(tick);
  }, [active, intervalMs, maxSeconds, router]);

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
