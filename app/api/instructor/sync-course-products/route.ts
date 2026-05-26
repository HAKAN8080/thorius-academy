import { NextResponse } from "next/server";
import { backfillCourseProductsFromWordPress } from "@/lib/webhooks/backfill-course-products";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const wpPageParam = url.searchParams.get("wpPage");
  const wpPage = wpPageParam ? parseInt(wpPageParam, 10) : undefined;
  const freeOnly = url.searchParams.get("freeOnly") === "1";

  const result = await backfillCourseProductsFromWordPress({
    wpPage: Number.isFinite(wpPage) && wpPage! > 0 ? wpPage : undefined,
    freeOnly,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}
