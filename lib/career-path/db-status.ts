import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface CareerPathDbStatus {
  hasServiceRole: boolean;
  hasCareerPathsTable: boolean;
  rowCount: number;
}

export async function getCareerPathDbStatus(): Promise<CareerPathDbStatus> {
  let hasServiceRole = true;
  try {
    getSupabaseAdmin();
  } catch {
    hasServiceRole = false;
  }

  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("career_paths")
      .select("*", { count: "exact", head: true });

    if (error) {
      const message = error.message.toLowerCase();
      const tableMissing =
        message.includes("does not exist") ||
        message.includes("could not find") ||
        message.includes("schema cache");

      return {
        hasServiceRole,
        hasCareerPathsTable: !tableMissing,
        rowCount: 0,
      };
    }

    return {
      hasServiceRole,
      hasCareerPathsTable: true,
      rowCount: count ?? 0,
    };
  } catch {
    return {
      hasServiceRole,
      hasCareerPathsTable: false,
      rowCount: 0,
    };
  }
}
