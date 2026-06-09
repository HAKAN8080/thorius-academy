import { NextResponse } from "next/server";
import { runMembershipRenewalBatch } from "@/lib/campaign/run-membership-renewal-batch";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) {
    return true;
  }

  const url = new URL(request.url);
  return url.searchParams.get("secret") === secret;
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return parsed;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const offset = parsePositiveInt(url.searchParams.get("offset"), 0);
  const limit = Math.min(
    parsePositiveInt(url.searchParams.get("limit"), 25),
    50,
  );
  const dryRun = url.searchParams.get("dry_run") === "true";
  const forceResend = url.searchParams.get("force") === "true";

  const result = await runMembershipRenewalBatch({
    offset,
    limit,
    dryRun,
    forceResend,
  });

  if (!result.success) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

export async function GET(request: Request) {
  return POST(request);
}
