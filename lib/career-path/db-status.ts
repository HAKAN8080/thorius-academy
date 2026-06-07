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
    const { data, error } = await supabase
      .from("career_paths")
      .select("id")
      .limit(5);

    if (error) {
      return {
        hasServiceRole,
        hasCareerPathsTable: false,
        rowCount: 0,
      };
    }

    return {
      hasServiceRole,
      hasCareerPathsTable: true,
      rowCount: data?.length ?? 0,
    };
  } catch {
    return {
      hasServiceRole,
      hasCareerPathsTable: false,
      rowCount: 0,
    };
  }
}
