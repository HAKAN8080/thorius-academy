import { NextResponse } from "next/server";
import {
  describeSupabaseKey,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { isSignupEmailConfigured } from "@/lib/email/send-signup-welcome";
import { getSignupCouponCode } from "@/lib/constants/promo";
import { getAppOrigin } from "@/lib/auth/app-url";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const expected = process.env.CRON_SECRET ?? process.env.HEALTHCHECK_TOKEN;

  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    ok: true,
    appOrigin: getAppOrigin(),
    supabaseUrl: Boolean(getSupabaseUrl()),
    publishableKey: describeSupabaseKey(getSupabasePublishableKey(), "publishable"),
    serviceRoleKey: describeSupabaseKey(getSupabaseServiceRoleKey(), "service"),
    resendConfigured: isSignupEmailConfigured(),
    signupCouponCode: getSignupCouponCode(),
  });
}
