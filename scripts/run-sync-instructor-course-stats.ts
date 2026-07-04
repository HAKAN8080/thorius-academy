import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ensureInstructorCourseStatsFromCache } from "@/lib/instructor/sync-instructor-course-stats";

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
  loadEnvFile(resolve(process.cwd(), ".env.local"));
  loadEnvFile(resolve(process.cwd(), ".env"));

  const wpInstructorId = Number(process.argv[2] ?? "1");
  const rowsUpserted = await ensureInstructorCourseStatsFromCache(wpInstructorId);
  console.log(JSON.stringify({ wpInstructorId, rowsUpserted }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
