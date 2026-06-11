import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { signWebhookPayload } from "@/lib/webhooks/verify-signature";
import { getWpSiteOrigin } from "@/lib/wordpress/wp-site-origin";

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

export interface WcTutorGapRow {
  order_id: number;
  order_date: string | null;
  email: string;
  customer_name: string;
  wp_user_id: number;
  product_id: number;
  course_id: number;
  course_title: string;
  course_slug: string;
}

export interface WcTutorGapResult {
  total_orders_scanned: number;
  total_course_purchases: number;
  gap_count: number;
  unique_customers_with_gaps: number;
  gaps: WcTutorGapRow[];
  error?: string;
}

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

function printGapTable(gaps: WcTutorGapRow[]): void {
  if (gaps.length === 0) {
    console.log("  (boş)");
    return;
  }

  const headers = [
    "Sipariş",
    "Tarih",
    "E-posta",
    "Müşteri",
    "WP ID",
    "Ürün",
    "Kurs",
    "Slug",
  ];

  const rows = gaps.map((gap) => [
    String(gap.order_id),
    formatDate(gap.order_date),
    gap.email || "—",
    gap.customer_name || "—",
    gap.wp_user_id > 0 ? String(gap.wp_user_id) : "—",
    String(gap.product_id),
    `${gap.course_id}: ${gap.course_title}`,
    gap.course_slug,
  ]);

  const widths = headers.map((header, index) =>
    Math.max(
      header.length,
      ...rows.map((row) => (row[index] ?? "").length),
    ),
  );

  const pad = (value: string, width: number) =>
    value.padEnd(width, " ");

  console.log(headers.map((header, i) => pad(header, widths[i]!)).join("  "));
  console.log(widths.map((width) => "-".repeat(width)).join("  "));
  for (const row of rows) {
    console.log(row.map((cell, i) => pad(cell, widths[i]!)).join("  "));
  }
}

async function fetchWcTutorGap(): Promise<{
  status: number;
  body: WcTutorGapResult | { error?: string } | null;
}> {
  const secret = process.env.WP_WEBHOOK_SECRET;
  const wpOrigin = getWpSiteOrigin();

  if (!secret) {
    throw new Error("WP_WEBHOOK_SECRET .env.local içinde tanımlı değil.");
  }

  if (!wpOrigin) {
    throw new Error(
      "WordPress site URL tanımlı değil (NEXT_PUBLIC_WP_SITE_URL veya WP_API_URL).",
    );
  }

  const payload = JSON.stringify({ audit: true });
  const url = `${wpOrigin}/wp-json/thorius/v1/academy-wc-tutor-gap`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-WP-Webhook-Signature": signWebhookPayload(payload, secret),
    },
    body: payload,
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | WcTutorGapResult
    | { error?: string }
    | null;

  return { status: response.status, body };
}

async function main(): Promise<void> {
  const wpOrigin = getWpSiteOrigin() ?? "(tanımsız)";
  console.log(`\nWooCommerce → Tutor kayıt boşluğu denetimi`);
  console.log(`WordPress: ${wpOrigin}\n`);

  const { status, body } = await fetchWcTutorGap();

  if (status === 404) {
    console.error(
      "❌ Endpoint bulunamadı (HTTP 404).\n" +
        "   thorius-academy-sync eklentisinin v1.8.3+ sürümünü WordPress'e yükleyin:\n" +
        "   wordpress/thorius-academy-sync/ → zip → Eklentiler → Yükle\n",
    );
    process.exit(1);
  }

  if (status === 401) {
    console.error(
      "❌ İmza doğrulanamadı (HTTP 401). WP_WEBHOOK_SECRET ile WordPress webhook secret aynı olmalı.",
    );
    process.exit(1);
  }

  if (status === 503) {
    console.error(
      "❌ Academy sync WordPress tarafında kapalı (HTTP 503). Eklenti ayarlarından etkinleştirin.",
    );
    process.exit(1);
  }

  if (!body || status < 200 || status >= 300) {
    console.error(
      `❌ İstek başarısız (HTTP ${status}):`,
      body ?? "(boş yanıt)",
    );
    process.exit(1);
  }

  if ("error" in body && body.error && !("gap_count" in body)) {
    console.error(`❌ WordPress hatası: ${body.error}`);
    process.exit(1);
  }

  const result = body as WcTutorGapResult;

  console.log("── Özet ──────────────────────────────────────────");
  console.log(`Taranan sipariş sayısı     : ${result.total_orders_scanned}`);
  console.log(`Kurs satın alımı (toplam)  : ${result.total_course_purchases}`);
  console.log(`Tutor kaydı eksik (gap)    : ${result.gap_count}`);
  console.log(
    `Etkilenen benzersiz müşteri: ${result.unique_customers_with_gaps}`,
  );

  if (result.error) {
    console.log(`\n⚠️  Uyarı: ${result.error}`);
  }

  if (result.gap_count === 0) {
    console.log(
      "\n✅ Tüm WooCommerce kurs satın alımlarında Tutor kaydı mevcut.",
    );
  } else {
    console.log(
      `\n⚠️  ${result.gap_count} satın alımda Tutor kaydı yok — bu müşteriler academy-member-list ile görünmez.`,
    );
    console.log("\n── Eksik kayıtlar ────────────────────────────────");
    printGapTable(result.gaps);
  }

  console.log("\n── JSON ────────────────────────────────────────────");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
