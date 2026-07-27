"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type PollState = "idle" | "waiting" | "ready" | "timeout" | "guest";

function withPendingQuery(href: string, orderId: string): string {
  try {
    const absolute = href.startsWith("http")
      ? new URL(href)
      : new URL(href, "https://academy.thorius.com.tr");
    absolute.searchParams.set("pending", "1");
    if (orderId) {
      absolute.searchParams.set("order_id", orderId);
    }
    if (href.startsWith("http")) {
      return absolute.toString();
    }
    return `${absolute.pathname}${absolute.search}${absolute.hash}`;
  } catch {
    return href;
  }
}

export function PurchaseReadyCta({
  orderId,
  nextHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  isExternalNext,
}: {
  orderId: string;
  nextHref: string;
  ctaLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  isExternalNext: boolean;
}) {
  const [state, setState] = useState<PollState>(orderId ? "waiting" : "idle");
  const [href, setHref] = useState(() =>
    orderId ? withPendingQuery(nextHref, orderId) : nextHref,
  );

  useEffect(() => {
    setHref(orderId ? withPendingQuery(nextHref, orderId) : nextHref);
  }, [nextHref, orderId]);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      attempts += 1;
      try {
        // Safety net: claim entitlement if webhook missed
        await fetch("/api/purchase/claim", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order_id: orderId }),
        }).catch(() => null);

        const response = await fetch(
          `/api/purchase/status?order_id=${encodeURIComponent(orderId)}`,
          { credentials: "include" },
        );

        if (response.status === 401) {
          if (!cancelled) setState("guest");
          return;
        }

        const payload = (await response.json().catch(() => null)) as {
          ready?: boolean;
        } | null;

        if (payload?.ready) {
          if (!cancelled) {
            setState("ready");
            setHref(nextHref);
          }
          return;
        }
      } catch {
        // keep waiting
      }

      if (attempts >= maxAttempts) {
        if (!cancelled) setState("timeout");
        return;
      }

      if (!cancelled) {
        timer = setTimeout(tick, 3000);
      }
    };

    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, nextHref]);

  const statusMessage =
    state === "waiting"
      ? "Erişiminiz hazırlanıyor — genelde birkaç saniye sürer."
      : state === "ready"
        ? "Erişiminiz hazır. Panele geçebilirsiniz."
        : state === "timeout"
          ? "Tanımlama biraz gecikebilir. Panele gidip birkaç dakika sonra yenileyin."
          : state === "guest"
            ? "İçeriğinizi görmek için giriş yaptığınızdan emin olun."
            : null;

  const primaryLabel =
    state === "waiting" ? "Erişim hazırlanıyor…" : ctaLabel;

  return (
    <div className="space-y-3">
      {statusMessage ? (
        <p
          className={`text-sm ${
            state === "ready"
              ? "text-emerald-700"
              : state === "timeout"
                ? "text-amber-800"
                : "text-muted-foreground"
          }`}
          role="status"
        >
          {statusMessage}
        </p>
      ) : null}

      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        {state === "waiting" ? (
          <Button
            size="lg"
            className="bg-accent-500 font-semibold text-primary-950"
            disabled
          >
            {primaryLabel}
          </Button>
        ) : (
          <Button
            asChild
            size="lg"
            className="bg-accent-500 font-semibold text-primary-950 hover:bg-accent-600"
          >
            {isExternalNext ? (
              <a href={href}>{primaryLabel}</a>
            ) : (
              <Link href={href}>{primaryLabel}</Link>
            )}
          </Button>
        )}
        <Button asChild variant="outline" size="lg">
          <Link href={secondaryHref}>{secondaryLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
