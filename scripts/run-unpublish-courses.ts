import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  listCoursesForUnpublish,
  unpublishCourses,
} from "@/lib/course/unpublish-courses";

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
Kurs yayından kaldır — courses_cache.published=false + course_products pasif

Kullanım:
  npx tsx scripts/run-unpublish-courses.ts [seçenekler]

Seçenekler:
  --list                  Eşleşen kursları listele (yazma yok)
  --dry-run               Ne yapılacağını göster
  --slug=SLUG             Tek slug (birden fazla --slug verilebilir)
  --prefix=PREFIX         course_slug öneki (ör. mit-projection-theory)
  --category=TEXT         category ILIKE filtresi (ör. MIT)
  --help                  Bu metni göster

Örnekler:
  npx tsx scripts/run-unpublish-courses.ts --category=MIT --list
  npx tsx scripts/run-unpublish-courses.ts --prefix=mit-projection-theory --dry-run
  npx tsx scripts/run-unpublish-courses.ts --prefix=mit-making-science
`);
}

function readArgValue(flag: string): string | undefined {
  const direct = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (direct) {
    return direct.slice(flag.length + 1).trim();
  }
  return undefined;
}

function readAllArgValues(flag: string): string[] {
  return process.argv
    .filter((arg) => arg.startsWith(`${flag}=`))
    .map((arg) => arg.slice(flag.length + 1).trim())
    .filter(Boolean);
}

async function main(): Promise<void> {
  if (process.argv.includes("--help")) {
    printUsage();
    return;
  }

  const filter = {
    slugs: readAllArgValues("--slug"),
    slugPrefix: readArgValue("--prefix"),
    categoryIncludes: readArgValue("--category"),
  };

  if (
    filter.slugs.length === 0 &&
    !filter.slugPrefix &&
    !filter.categoryIncludes
  ) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const listOnly = process.argv.includes("--list");
  const dryRun = process.argv.includes("--dry-run");

  if (listOnly) {
    const courses = await listCoursesForUnpublish(filter);
    console.log(`Eşleşen kurs: ${courses.length}`);
    for (const course of courses) {
      console.log(
        `- [${course.published ? "yayında" : "gizli"}] ${course.slug} | ${course.title}`,
      );
    }
    return;
  }

  const result = await unpublishCourses(filter, { dryRun });
  console.log(
    dryRun
      ? `[dry-run] ${result.matched.length} kurs yayından kaldırılacak`
      : `${result.unpublished} kurs yayından kaldırıldı`,
  );
  console.log(
    dryRun
      ? `[dry-run] ${result.matched.filter((c) => c.wpCourseId).length} ürün pasifleştirilecek`
      : `${result.productsDeactivated} ürün pasifleştirildi`,
  );

  for (const course of result.matched) {
    console.log(`- ${course.slug}`);
  }

  if (!dryRun && result.unpublished > 0) {
    console.log(
      "\nNot: Ana sayfa cache ~1 saat sürebilir. WP tarafında da çöpe atmak istersen Tutor LMS → Courses.",
    );
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
