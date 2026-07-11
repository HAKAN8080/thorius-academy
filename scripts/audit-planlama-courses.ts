import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function main(): Promise<void> {
  const root = resolve(process.cwd());
  loadEnvFile(resolve(root, ".env.local"));
  loadEnvFile(resolve(root, ".env"));

  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("courses_cache")
    .select(
      "id,course_slug,title,subtitle,description_md,title_en,subtitle_en,description_md_en,category,language,wp_course_id",
    )
    .eq("published", true)
    .eq("visibility", "public")
    .ilike("category", "%planlama%")
    .order("title");

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  const courses = data ?? [];
  console.log(`Found ${courses.length} planlama courses\n`);

  for (const row of courses) {
    const slug = row.course_slug as string;
    const { data: sections } = await admin
      .from("sections")
      .select("id,title,title_en,sort_order")
      .eq("course_id", row.id)
      .order("sort_order");

    const { data: lessons } = await admin
      .from("lessons")
      .select("id,title,title_en,section_id,sort_order")
      .eq("courses_cache_id", row.id)
      .order("sort_order");

    console.log("---");
    console.log("slug:", slug);
    console.log("title:", row.title);
    console.log("title_en:", row.title_en ?? "(empty)");
    console.log("language:", row.language);
    console.log(
      "subtitle:",
      ((row.subtitle as string) ?? "").slice(0, 120) || "(empty)",
    );
    console.log(
      "description_md:",
      ((row.description_md as string) ?? "").slice(0, 200) || "(empty)",
    );
    console.log(
      "description_md_en:",
      ((row.description_md_en as string) ?? "").slice(0, 200) || "(empty)",
    );
    console.log("sections:", sections?.length ?? 0);
    console.log("lessons:", lessons?.length ?? 0);
    if (sections?.length) {
      for (const s of sections) {
        console.log(`  [S] ${s.title}${s.title_en ? ` | EN: ${s.title_en}` : ""}`);
      }
    }
    if (lessons?.length) {
      for (const l of lessons.slice(0, 30)) {
        console.log(`  [L] ${l.title}${l.title_en ? ` | EN: ${l.title_en}` : ""}`);
      }
      if (lessons.length > 30) console.log(`  ... +${lessons.length - 30} more`);
    }
  }

  writeFileSync(
    resolve(root, "scripts/.planlama-audit.json"),
    JSON.stringify(courses, null, 2),
  );
  console.log(`\nWrote scripts/.planlama-audit.json`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
