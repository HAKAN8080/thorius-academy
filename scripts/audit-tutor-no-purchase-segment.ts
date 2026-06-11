import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fetchTutorNoPurchaseSegment } from "@/lib/campaign/tutor-no-purchase-segment";
import { fetchWpMembersPage } from "@/lib/tutor/fetch-wp-members";
import { getAppOrigin } from "@/lib/auth/app-url";

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

loadEnvFile(resolve(process.cwd(), ".env.local"));
loadEnvFile(resolve(process.cwd(), ".env"));

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

function printMemberTable(
  members: Awaited<
    ReturnType<typeof fetchTutorNoPurchaseSegment>
  >["members"],
): void {
  if (members.length === 0) {
    console.log("  (boş)");
    return;
  }

  const headers = [
    "E-posta",
    "Ad",
    "WP ID",
    "Kurs",
    "İlerleme",
    "Sync",
    "Kampanya",
    "Son giriş",
  ];

  const rows = members.map((member) => {
    const courseLabels = member.tutor_courses
      .map((c) => c.slug)
      .slice(0, 2)
      .join(", ");
    const extra =
      member.tutor_courses.length > 2
        ? ` +${member.tutor_courses.length - 2}`
        : "";
    const maxProgress = Math.max(
      0,
      ...member.tutor_courses.map((c) => c.progress),
    );

    return [
      member.email || "—",
      member.full_name?.slice(0, 20) ?? "—",
      member.wp_user_id ? String(member.wp_user_id) : "—",
      `${courseLabels}${extra}`,
      `${maxProgress}%`,
      member.tutor_legacy_synced_at ? "✓" : "—",
      member.membership_renewal_campaign_at ? "✓" : "—",
      formatDate(member.last_sign_in_at),
    ];
  });

  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i].length)),
  );

  const pad = (value: string, width: number) => value.padEnd(width);

  console.log(headers.map((h, i) => pad(h, widths[i])).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(row.map((cell, i) => pad(cell, widths[i])).join("  "));
  }
}

function printCampaignChecklist(): void {
  const appOrigin = getAppOrigin();
  const cronHint = process.env.CRON_SECRET
    ? `${appOrigin}/api/admin/membership-renewal-campaign?secret=***&dry_run=true`
    : "(CRON_SECRET tanımlı değil — .env.local)";

  console.log(`
── Kampanya checklist ───────────────────────────
□ 1. Migration tamam
     npm run migrate:wp-users -- --all

□ 2. Segment doğrula (bu komut)
     npm run audit:tutor-no-purchase
     Supabase SQL: supabase/manual/tutor_no_purchase_segment.sql

□ 3. WP Tutor üye sayısı ≈ segment sayısı
     Fark varsa migrate:wp-users -- --force ile yeniden senkron

□ 4. Kampanya dry-run (tek batch)
     POST ${cronHint}
     offset=0&limit=25

□ 5. Kendinize test maili
     force=true ile tek e-posta veya Resend preview

□ 6. Canlı kampanya (batch batch)
     dry_run=false, has_more false olana kadar offset artır
     Her batch sonrası sent / failed kontrol

□ 7. Giriş sonrası
     /panel/kurslarim — kurs + ilerleme görünüyor mu?
     Tutor linki yok, Academy oynatıcı açılıyor mu?

□ 8. Pazarlama segmenti (Supabase)
     source=tutor_legacy AND wc satın alımı yok
     İlerleme %50+ → “bitir” hatırlatması
     Hiç giriş yok → şifre kurulumu maili (membership renewal)
`);
}

async function main() {
  const jsonOnly = process.argv.includes("--json");
  const skipWp = process.argv.includes("--no-wp");

  let wpTotal: number | null = null;
  if (!skipWp && process.env.WP_WEBHOOK_SECRET?.trim()) {
    const page = await fetchWpMembersPage({ offset: 0, limit: 1 });
    wpTotal = page?.total ?? null;
  }

  const result = await fetchTutorNoPurchaseSegment({
    wpTutorMemberTotal: wpTotal,
  });

  if (jsonOnly) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("Tutor üyesi, WC satın alımı yok — pazarlama segmenti");
  console.log(`Kaynak: Supabase enrollments + auth\n`);

  console.log("── Özet ──────────────────────────────────────────");
  console.log(`Segment (Supabase)           : ${result.segment_count}`);
  if (result.stats.wp_tutor_member_total != null) {
    console.log(
      `WP Tutor üye (member-list)  : ${result.stats.wp_tutor_member_total}`,
    );
    if (result.stats.not_yet_migrated_to_supabase != null) {
      console.log(
        `Henüz Academy'de olmayan  : ${result.stats.not_yet_migrated_to_supabase}`,
      );
    }
  }
  console.log(
    `Kampanya maili gönderilmiş : ${result.stats.with_campaign_email_sent}`,
  );
  console.log(`En az bir giriş yapmış     : ${result.stats.with_last_sign_in}`);

  console.log("\n── Üyeler ────────────────────────────────────────");
  printMemberTable(result.members);

  printCampaignChecklist();

  console.log("── JSON ────────────────────────────────────────────");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
