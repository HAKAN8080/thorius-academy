"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { runYayineviPipeline } from "@/lib/yayinevi/orchestrator/run-pipeline";
import { canAccessYayinevi } from "@/lib/yayinevi/access";
import {
  createContextSetFromPipeline,
  getContextSetDetail,
  listContextSetsForAuthor,
  updateContextSetStatus,
} from "@/lib/yayinevi/repository";
import type { PublisherDifficulty } from "@/types/yayinevi";

async function requireYayineviEditor() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id || !canAccessYayinevi(user.email)) {
    return null;
  }
  return { userId: user.id, email: user.email! };
}

export async function generateContextSetAction(input: {
  outcomeCode?: string;
  processComponentLetter?: string;
  difficulty?: PublisherDifficulty;
  contextTheme?: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const access = await requireYayineviEditor();
  if (!access) {
    return { ok: false, error: "Yetkiniz yok" };
  }

  try {
    const pipeline = await runYayineviPipeline(input);
    const id = await createContextSetFromPipeline({
      authorId: access.userId,
      outcomeCode: input.outcomeCode ?? "MAT.8.1.1",
      processComponentLetter: input.processComponentLetter ?? "c",
      difficulty: input.difficulty ?? "orta",
      pipeline,
    });
    revalidatePath("/yayinevi");
    return { ok: true, id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Üretim başarısız",
    };
  }
}

export async function listContextSetsAction() {
  const access = await requireYayineviEditor();
  if (!access) return [];
  return listContextSetsForAuthor(access.userId);
}

export async function getContextSetAction(id: string) {
  const access = await requireYayineviEditor();
  if (!access) return null;
  return getContextSetDetail(id, access.userId);
}

export async function approveContextSetAction(
  id: string,
  mebChecklist: Record<string, unknown>,
) {
  const access = await requireYayineviEditor();
  if (!access) {
    return { ok: false as const, error: "Yetkiniz yok" };
  }

  await updateContextSetStatus({
    id,
    authorId: access.userId,
    status: "approved",
    mebChecklist,
  });
  revalidatePath("/yayinevi");
  revalidatePath(`/yayinevi/${id}`);
  return { ok: true as const };
}

export async function rejectContextSetAction(id: string, notes: string) {
  const access = await requireYayineviEditor();
  if (!access) {
    return { ok: false as const, error: "Yetkiniz yok" };
  }

  await updateContextSetStatus({
    id,
    authorId: access.userId,
    status: "rejected",
    reviewerNotes: notes,
  });
  revalidatePath("/yayinevi");
  revalidatePath(`/yayinevi/${id}`);
  return { ok: true as const };
}

export async function submitForReviewAction(id: string) {
  const access = await requireYayineviEditor();
  if (!access) {
    return { ok: false as const, error: "Yetkiniz yok" };
  }

  await updateContextSetStatus({
    id,
    authorId: access.userId,
    status: "in_review",
  });
  revalidatePath("/yayinevi");
  revalidatePath(`/yayinevi/${id}`);
  return { ok: true as const };
}
