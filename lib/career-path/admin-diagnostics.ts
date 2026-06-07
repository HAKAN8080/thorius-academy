import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getSupabaseProjectRef,
  getSupabasePublishableKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export interface CareerPathAdminDiagnostics {
  projectRef: string | null;
  hasPublishableKey: boolean;
  hasServiceRole: boolean;
  sessionCount: number | null;
  adminCount: number | null;
  sessionError: string | null;
  adminError: string | null;
}

export async function getCareerPathAdminDiagnostics(): Promise<CareerPathAdminDiagnostics> {
  const diagnostics: CareerPathAdminDiagnostics = {
    projectRef: getSupabaseProjectRef(),
    hasPublishableKey: Boolean(getSupabasePublishableKey()),
    hasServiceRole: Boolean(getSupabaseServiceRoleKey()),
    sessionCount: null,
    adminCount: null,
    sessionError: null,
    adminError: null,
  };

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("career_paths")
      .select("*", { count: "exact", head: true });

    if (error) {
      diagnostics.sessionError = error.message;
    } else {
      diagnostics.sessionCount = count ?? 0;
    }
  } catch (error) {
    diagnostics.sessionError =
      error instanceof Error ? error.message : "Session client failed";
  }

  if (diagnostics.hasServiceRole) {
    try {
      const admin = getSupabaseAdmin();
      const { count, error } = await admin
        .from("career_paths")
        .select("*", { count: "exact", head: true });

      if (error) {
        diagnostics.adminError = error.message;
      } else {
        diagnostics.adminCount = count ?? 0;
      }
    } catch (error) {
      diagnostics.adminError =
        error instanceof Error ? error.message : "Admin client failed";
    }
  } else {
    diagnostics.adminError = "SUPABASE_SERVICE_ROLE_KEY tanımlı değil";
  }

  return diagnostics;
}

export function getSupabaseUrlForDisplay(): string | null {
  return getSupabaseUrl();
}
