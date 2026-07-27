import { NextRequest, NextResponse } from "next/server";
import { fulfillEbookPurchase } from "@/lib/kitaplik/fulfill-ebook-purchase";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type WcOrder = {
  id: number;
  status: string;
  billing?: { email?: string };
  line_items?: Array<{ product_id: number; name?: string }>;
};

function getWpAuthHeader(): string | null {
  const user = process.env.WP_USERNAME?.trim();
  const pass = process.env.WP_APP_PASSWORD?.trim();
  if (!user || !pass) return null;
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
}

function getWpBase(): string {
  return (
    process.env.NEXT_PUBLIC_WP_SITE_URL?.replace(/\/$/, "") ||
    "https://thorius.com.tr"
  );
}

async function fetchWcOrder(orderId: number): Promise<WcOrder | null> {
  const auth = getWpAuthHeader();
  if (!auth) return null;
  const res = await fetch(`${getWpBase()}/wp-json/wc/v3/orders/${orderId}`, {
    headers: { Authorization: auth },
    cache: "no-store",
  });
  if (!res.ok) return null;
  return (await res.json()) as WcOrder;
}

async function patchOrderBillingEmail(
  orderId: number,
  email: string,
): Promise<void> {
  const auth = getWpAuthHeader();
  if (!auth) return;
  await fetch(`${getWpBase()}/wp-json/wc/v3/orders/${orderId}`, {
    method: "PUT",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      billing: { email },
    }),
  }).catch(() => undefined);
}

/**
 * Safety net: logged-in buyer claims a paid/processing WC order into Kitaplarım
 * when webhook missed (e.g. empty billing email on free-coupon checkout).
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    order_id?: string | number;
  } | null;
  const orderId = Number(body?.order_id);
  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_order_id" }, { status: 400 });
  }

  if (!getWpAuthHeader()) {
    return NextResponse.json(
      { ok: false, error: "wp_credentials_missing" },
      { status: 503 },
    );
  }

  const order = await fetchWcOrder(orderId);
  if (!order) {
    return NextResponse.json({ ok: false, error: "order_not_found" }, { status: 404 });
  }

  const status = (order.status || "").toLowerCase();
  if (!["processing", "completed"].includes(status)) {
    return NextResponse.json({
      ok: false,
      error: "order_not_paid",
      status,
    });
  }

  const orderEmail = order.billing?.email?.trim().toLowerCase() || "";
  const userEmail = user.email.trim().toLowerCase();

  if (orderEmail && orderEmail !== userEmail) {
    return NextResponse.json({ ok: false, error: "email_mismatch" }, { status: 403 });
  }

  if (!orderEmail) {
    await patchOrderBillingEmail(orderId, userEmail);
  }

  const granted: string[] = [];
  const errors: string[] = [];

  for (const item of order.line_items ?? []) {
    const result = await fulfillEbookPurchase({
      userId: user.id,
      wcOrderId: orderId,
      wcProductId: item.product_id,
    });

    if (result.printedOnly) continue;

    if (result.success && result.bookSlug) {
      granted.push(result.bookSlug);
    } else if (!result.success && result.error) {
      // Not a library product is fine to skip quietly
      if (!result.error.includes("katalog")) {
        errors.push(`${item.product_id}: ${result.error}`);
      }
    }
  }

  return NextResponse.json({
    ok: granted.length > 0 || errors.length === 0,
    order_id: orderId,
    granted,
    errors,
  });
}
