import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCourseProgressForUser } from "@/lib/progress/lesson-progress-service";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ courseId: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { courseId: courseIdParam } = await context.params;
  const courseId = parseInt(courseIdParam, 10);

  if (!Number.isFinite(courseId)) {
    return NextResponse.json({ error: "Invalid course_id" }, { status: 400 });
  }

  const progress = await getCourseProgressForUser(user.id, courseId);
  return NextResponse.json(progress);
}
