import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getInstructorAccess } from "@/lib/instructor/access";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  const access = await getInstructorAccess();

  return NextResponse.json({
    user: {
      isInstructor: access.isInstructor,
    },
  });
}
