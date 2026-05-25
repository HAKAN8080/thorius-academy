import { NextRequest, NextResponse } from "next/server";
import { verifyWooCommerceWebhookSignature } from "@/lib/woocommerce/verify-signature";
import { processWooCommerceOrder } from "@/lib/webhooks/process-wc-order";
import type { WooCommerceOrderWebhook } from "@/types/woocommerce-webhook";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function webhookResponse(
  body: Record<string, unknown>,
  status = 200,
): NextResponse {
  return NextResponse.json(body, { status });
}

export async function GET() {
  return webhookResponse({
    status: "ok",
    service: "WooCommerce Webhook Handler",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wc-webhook-signature");
    const secret = process.env.WC_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[Webhook] WC_WEBHOOK_SECRET is not configured");
      return webhookResponse(
        { error: "Webhook secret not configured" },
        500,
      );
    }

    const isValid = verifyWooCommerceWebhookSignature(
      rawBody,
      signature,
      secret,
    );

    if (!isValid) {
      console.error("[Webhook] Invalid signature");
      return webhookResponse({ error: "Invalid signature" }, 401);
    }

    const order = JSON.parse(rawBody) as WooCommerceOrderWebhook;

    console.log("[Webhook] Order received:", {
      id: order.id,
      status: order.status,
      email: order.billing?.email,
    });

    if (order.status !== "completed") {
      return webhookResponse({
        message: "Order not completed, skipping",
        status: order.status,
        order_id: order.id,
      });
    }

    const result = await processWooCommerceOrder(order);

    return webhookResponse({
      ...result,
    });
  } catch (error) {
    console.error("[Webhook] Fatal error:", error);
    return webhookResponse(
      {
        success: false,
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      200,
    );
  }
}
