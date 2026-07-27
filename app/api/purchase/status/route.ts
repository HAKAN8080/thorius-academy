import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Post-purchase soft-poll: has this WC order been fulfilled for the current user?
 */
export async function GET(request: NextRequest) {
  const orderIdRaw = request.nextUrl.searchParams.get("order_id")?.trim();
  const orderId = orderIdRaw ? Number.parseInt(orderIdRaw, 10) : NaN;

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json(
      { ready: false, error: "invalid_order_id" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { ready: false, authenticated: false },
      { status: 401 },
    );
  }

  const admin = getSupabaseAdmin();

  const [ebookCheck, enrollmentCheck, pathCheck] = await Promise.all([
    admin
      .from("ebook_entitlements")
      .select("id, library_book_id")
      .eq("wc_order_id", orderId)
      .eq("user_id", user.id)
      .limit(5),
    admin
      .from("enrollments")
      .select("id, course_slug")
      .eq("wc_order_id", orderId)
      .eq("user_id", user.id)
      .limit(5),
    admin
      .from("career_path_enrollments")
      .select("id")
      .eq("wc_order_id", orderId)
      .eq("user_id", user.id)
      .limit(5),
  ]);

  const books = ebookCheck.data ?? [];
  const courses = enrollmentCheck.data ?? [];
  const paths = pathCheck.data ?? [];
  const ready = books.length > 0 || courses.length > 0 || paths.length > 0;

  return NextResponse.json({
    ready,
    authenticated: true,
    order_id: orderId,
    ebook_count: books.length,
    courses: courses.map((row) => row.course_slug).filter(Boolean),
    career_paths: paths.length,
  });
}
