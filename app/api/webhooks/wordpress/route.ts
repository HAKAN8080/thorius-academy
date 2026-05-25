import { NextRequest, NextResponse } from "next/server";
import { revalidateCourseCache } from "@/lib/webhooks/revalidate-course-cache";
import { syncCourseProductSlug } from "@/lib/webhooks/sync-course-product-slug";
import { verifyWebhookSignature } from "@/lib/webhooks/verify-signature";
import type { WordPressCourseWebhookPayload } from "@/types/wordpress-webhook";

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
    service: "WordPress Course Webhook Handler",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-wp-webhook-signature");
    const secret = process.env.WP_WEBHOOK_SECRET;

    if (!secret) {
      console.error("[WP Webhook] WP_WEBHOOK_SECRET is not configured");
      return webhookResponse(
        { error: "Webhook secret not configured" },
        500,
      );
    }

    const isValid = verifyWebhookSignature(rawBody, signature, secret);

    if (!isValid) {
      console.error("[WP Webhook] Invalid signature");
      return webhookResponse({ error: "Invalid signature" }, 401);
    }

    const payload = JSON.parse(rawBody) as WordPressCourseWebhookPayload;

    console.log("[WP Webhook] Course event received:", {
      event: payload.event,
      id: payload.course?.id,
      slug: payload.course?.slug,
      previous_slug: payload.course?.previous_slug,
      status: payload.course?.status,
    });

    if (!payload.course?.slug) {
      return webhookResponse({ error: "Missing course slug" }, 400);
    }

    const previousSlug = payload.course.previous_slug;
    const slugChanged =
      !!previousSlug && previousSlug !== payload.course.slug;

    let courseProductSlugSynced = false;
    if (slugChanged && payload.course.id) {
      courseProductSlugSynced = await syncCourseProductSlug(
        payload.course.id,
        payload.course.slug,
      );
    }

    const revalidation = revalidateCourseCache({
      slug: payload.course.slug,
      previousSlug,
    });

    return webhookResponse({
      success: true,
      event: payload.event,
      course_slug: payload.course.slug,
      previous_slug: previousSlug ?? null,
      course_product_slug_synced: courseProductSlugSynced,
      ...revalidation,
    });
  } catch (error) {
    console.error("[WP Webhook] Fatal error:", error);
    return webhookResponse(
      {
        success: false,
        error: "Webhook processing failed",
        details: error instanceof Error ? error.message : String(error),
      },
      500,
    );
  }
}
