import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCourseCertificate } from "@/lib/certificate/certificate-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function parseCourseId(value: unknown): number | null {
  const parsed =
    typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const courseId = parseCourseId((json as Record<string, unknown>).course_id);
  if (!courseId) {
    return NextResponse.json({ error: "course_id is required" }, { status: 400 });
  }

  const result = await generateCourseCertificate(
    supabase,
    user.id,
    user.email,
    courseId,
    { sendEmail: true },
  );

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    certificate_url: result.certificate_url,
    certificate_id: result.certificate_id,
    emailed: result.emailed,
  });
}
