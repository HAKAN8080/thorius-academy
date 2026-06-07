import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  describeSupabaseKey,
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
  publishableKeyKind: string;
  serviceRoleKeyKind: string;
  sessionCount: number | null;
  adminCount: number | null;
  sessionError: string | null;
  adminError: string | null;
}

export async function getCareerPathAdminDiagnostics(): Promise<CareerPathAdminDiagnostics> {
  const publishableKey = getSupabasePublishableKey();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  const diagnostics: CareerPathAdminDiagnostics = {
    projectRef: getSupabaseProjectRef(),
    hasPublishableKey: Boolean(publishableKey),
    hasServiceRole: Boolean(serviceRoleKey),
    publishableKeyKind: describeSupabaseKey(publishableKey, "publishable"),
    serviceRoleKeyKind: describeSupabaseKey(serviceRoleKey, "service"),
    sessionCount: null,
    adminCount: null,
    sessionError: null,
    adminError: null,
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("career_paths")
      .select("slug")
      .limit(10);

    if (error) {
      diagnostics.sessionError = `${error.message}${error.code ? ` (${error.code})` : ""}`;
    } else {
      diagnostics.sessionCount = data?.length ?? 0;
    }
  } catch (error) {
    diagnostics.sessionError =
      error instanceof Error ? error.message : "Session client failed";
  }

  if (diagnostics.hasServiceRole) {
    try {
      const admin = getSupabaseAdmin();
      const { data, error } = await admin
        .from("career_paths")
        .select("slug")
        .limit(10);

      if (error) {
        diagnostics.adminError = `${error.message}${error.code ? ` (${error.code})` : ""}`;
      } else {
        diagnostics.adminCount = data?.length ?? 0;
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
