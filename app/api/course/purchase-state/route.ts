import { NextRequest, NextResponse } from "next/server";
import { getCoursePurchaseState } from "@/lib/course/course-purchase-state";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * Auth-bound purchase CTA state for course detail pages.
 * Kept off the RSC tree so /kurslar/[slug] can stay ISR/static.
 */
export async function GET(request: NextRequest) {
  const courseIdRaw = request.nextUrl.searchParams.get("courseId")?.trim();
  const courseSlug = request.nextUrl.searchParams.get("slug")?.trim();
  const youtubeVideoId =
    request.nextUrl.searchParams.get("youtubeVideoId")?.trim() || null;

  const courseId = courseIdRaw ? Number.parseInt(courseIdRaw, 10) : NaN;

  if (!courseSlug || !Number.isFinite(courseId)) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }

  try {
    const state = await getCoursePurchaseState({
      id: courseId,
      slug: courseSlug,
      youtubeVideoId,
    });

    return NextResponse.json(state, {
      headers: {
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("[purchase-state]", error);
    return NextResponse.json(
      {
        isLoggedIn: false,
        isAlreadyEnrolled: false,
        courseProduct: null,
        customer: null,
      },
      { status: 200 },
    );
  }
}
