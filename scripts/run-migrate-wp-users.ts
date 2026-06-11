import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { runWpUsersMigrationBatch } from "@/lib/tutor/run-wp-users-migration-batch";

function loadEnvFile(filePath: string): void {
  if (!existsSync(filePath)) return;
  const content = readFileSync(filePath, "utf8");
  for (const line of content.split("\n")) {
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
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

function printUsage(): void {
  console.log(`
WordPress/Tutor üyeleri → Academy (Supabase) taşıma

Kullanım:
  npx tsx scripts/run-migrate-wp-users.ts --dry-run
  npx tsx scripts/run-migrate-wp-users.ts --offset 0 --limit 50
  npx tsx scripts/run-migrate-wp-users.ts --all
  npx tsx scripts/run-migrate-wp-users.ts --all --invite --force

Ne yapar:
  1. WP academy-member-list ile Tutor kayıtlı üyeleri sayfalar
  2. Supabase auth + profiles oluşturur / mevcut e-postayı bağlar (wp_user_id)
  3. academy-user-legacy ile kurs kayıtları + ders ilerlemesini enrollments'a yazar

Seçenekler:
  --offset <n>     Başlangıç (varsayılan 0)
  --limit <n>      Sayfa boyutu (varsayılan 25, max 100)
  --all            has_more false olana kadar tüm sayfalar
  --dry-run        Yazmadan üye listesini göster
  --force          Daha önce migrate edilmiş kullanıcıları yeniden senkronize et
  --invite         Yeni oluşturulan hesaplar için şifre sıfırlama linki üret (log)
`);
}

function parseArgs(argv: string[]) {
  const options = {
    offset: 0,
    limit: 25,
    all: false,
    dryRun: false,
    force: false,
    invite: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--offset") {
      options.offset = parseInt(argv[i + 1] ?? "", 10);
      i += 1;
    } else if (arg === "--limit") {
      options.limit = Math.min(parseInt(argv[i + 1] ?? "", 10) || 25, 100);
      i += 1;
    } else if (arg === "--all") {
      options.all = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--force") {
      options.force = true;
    } else if (arg === "--invite") {
      options.invite = true;
    } else if (arg === "--help" || arg === "-h") {
      printUsage();
      process.exit(0);
    }
  }

  return options;
}

async function runPage(
  offset: number,
  limit: number,
  options: ReturnType<typeof parseArgs>,
) {
  const result = await runWpUsersMigrationBatch({
    offset,
    limit,
    dryRun: options.dryRun,
    force: options.force,
    invite: options.invite,
  });

  console.log(
    JSON.stringify(
      {
        offset: result.offset,
        limit: result.limit,
        totalMembers: result.totalMembers,
        hasMore: result.hasMore,
        processed: result.processed,
        created: result.created,
        linked: result.linked,
        skippedAlreadyMigrated: result.skippedAlreadyMigrated,
        enrollmentsImported: result.enrollmentsImported,
        progressImported: result.progressImported,
        invitesSent: result.invitesSent,
        failed: result.failed,
        success: result.success,
      },
      null,
      2,
    ),
  );

  if (!result.success) {
    console.error("Batch başarısız — WP_WEBHOOK_SECRET ve plugin kontrol edin.");
    process.exit(1);
  }

  return result;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.dryRun && !process.env.WP_WEBHOOK_SECRET) {
    console.error("WP_WEBHOOK_SECRET gerekli (.env.local)");
    process.exit(1);
  }

  if (!options.all) {
    await runPage(options.offset, options.limit, options);
    return;
  }

  let offset = options.offset;
  let page = 0;

  while (true) {
    page += 1;
    console.log(`\n--- Sayfa ${page} (offset=${offset}) ---`);
    const result = await runPage(offset, options.limit, options);
    if (!result.hasMore) {
      break;
    }
    offset += result.limit;
  }

  console.log("\nTüm sayfalar tamamlandı.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
