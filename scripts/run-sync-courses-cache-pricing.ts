import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { syncCoursesCachePricingFromProducts } from "@/lib/course/sync-courses-cache-pricing";

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

function printUsage(): void {
  console.log(`
courses_cache fiyat alanlarını course_products ile eşitle

Kullanım:
  npx tsx scripts/run-sync-courses-cache-pricing.ts [seçenekler]

Seçenekler:
  --dry-run               Yazma yapmadan göster
  --slug=SLUG             Tek slug (ör. planlama)
  --help                  Bu metni göster
`);
}

async function main(): Promise<void> {
  loadEnvFile(resolve(process.cwd(), ".env.local"));

  const args = process.argv.slice(2);
  if (args.includes("--help")) {
    printUsage();
    return;
  }

  const dryRun = args.includes("--dry-run");
  const slugArg = args.find((arg) => arg.startsWith("--slug="));
  const slug = slugArg?.slice("--slug=".length);

  const result = await syncCoursesCachePricingFromProducts({ slug, dryRun });

  console.log(
    JSON.stringify(
      {
        dryRun,
        slug: slug ?? null,
        ...result,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
