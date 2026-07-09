import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccessYayinevi } from "@/lib/yayinevi/access";
import { runYayineviPipeline } from "@/lib/yayinevi/orchestrator/run-pipeline";
import { createContextSetFromPipeline } from "@/lib/yayinevi/repository";
import type { PublisherDifficulty } from "@/types/yayinevi";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id || !canAccessYayinevi(user.email)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  let body: {
    outcomeCode?: string;
    processComponentLetter?: string;
    difficulty?: PublisherDifficulty;
    contextTheme?: string;
    persist?: boolean;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  try {
    const pipeline = await runYayineviPipeline(body);

    if (body.persist === false) {
      return NextResponse.json({ pipeline });
    }

    const id = await createContextSetFromPipeline({
      authorId: user.id,
      outcomeCode: body.outcomeCode ?? "MAT.8.1.1",
      processComponentLetter: body.processComponentLetter ?? "c",
      difficulty: body.difficulty ?? "orta",
      pipeline,
    });

    return NextResponse.json({ id, pipeline });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Üretim hatası";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
