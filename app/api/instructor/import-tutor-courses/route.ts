import { NextResponse } from "next/server";
import {
  importAllTutorCoursesToAcademy,
  importTutorCourseToAcademy,
} from "@/lib/tutor/import-courses-to-academy";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

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
  const dryRun = url.searchParams.get("dryRun") === "1";
  const force = url.searchParams.get("force") === "1";
  const syncCatalogFirst = url.searchParams.get("noSync") !== "1";
  const courseIdParam = url.searchParams.get("courseId");
  const limitParam = url.searchParams.get("limit");
  const all = url.searchParams.get("all") === "1" || !courseIdParam;

  if (!all && courseIdParam) {
    const wpCourseId = parseInt(courseIdParam, 10);
    if (!Number.isFinite(wpCourseId) || wpCourseId <= 0) {
      return NextResponse.json({ error: "Invalid courseId" }, { status: 400 });
    }

    const result = await importTutorCourseToAcademy({
      wpCourseId,
      dryRun,
      skipIfHasLessons: !force,
    });

    return NextResponse.json(result, { status: result.error ? 500 : 200 });
  }

  const limit =
    limitParam && Number.isFinite(parseInt(limitParam, 10))
      ? parseInt(limitParam, 10)
      : undefined;

  const summary = await importAllTutorCoursesToAcademy({
    limit,
    dryRun,
    skipIfHasLessons: !force,
    syncCatalogFirst,
  });

  return NextResponse.json(summary, {
    status: summary.failed > 0 ? 500 : 200,
  });
}
