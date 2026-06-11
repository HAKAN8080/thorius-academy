import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createPasswordRenewalLink } from "@/lib/campaign/membership-renewal-user";
import {
  pickMembershipRenewalPromoCourses,
  type PromoCourse,
} from "@/lib/campaign/pick-promo-courses";
import { sendMembershipRenewalEmail } from "@/lib/campaign/send-membership-renewal-email";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

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

function parseArgs() {
  const emailArg = process.argv.find((arg) => arg.includes("@"));
  const email =
    emailArg?.trim().toLowerCase() ?? "mhakan_ugur@yahoo.com";
  const fullName =
    process.argv.find((arg) => arg.startsWith("--name="))?.slice(7) ??
    "M.Hakan UĞUR";

  return { email, fullName };
}

async function pickPromoCoursesForCli(): Promise<PromoCourse[]> {
  try {
    return await pickMembershipRenewalPromoCourses();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn("[Test] WP katalog atlandı (CLI):", message.slice(0, 120));

    const admin = getSupabaseAdmin();
    const { data, error: dbError } = await admin
      .from("courses_cache")
      .select("course_slug, title, subtitle")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(4);

    if (dbError) {
      console.warn("[Test] courses_cache okunamadı:", dbError.message);
      return [];
    }

    return (data ?? [])
      .filter((row) => row.course_slug && row.title)
      .map((row) => ({
        slug: String(row.course_slug),
        title: String(row.title),
        excerpt: String(row.subtitle || row.title).slice(0, 120),
        category: null,
      }));
  }
}

async function main() {
  const { email, fullName } = parseArgs();

  if (!process.env.RESEND_API_KEY?.trim()) {
    console.error("RESEND_API_KEY gerekli (.env.local)");
    process.exit(1);
  }

  if (!process.env.SUPABASE_SECRET_KEY?.trim()) {
    console.error("SUPABASE_SECRET_KEY gerekli (.env.local)");
    process.exit(1);
  }

  console.log(`Deneme membership renewal maili → ${email}`);

  const renewalLink = await createPasswordRenewalLink(email);
  if (!renewalLink) {
    console.error("Recovery link üretilemedi (Supabase auth)");
    process.exit(1);
  }

  const promoCourses = await pickPromoCoursesForCli();
  const sent = await sendMembershipRenewalEmail({
    email,
    fullName,
    passwordRenewalLink: renewalLink,
    promoCourses,
  });

  if (!sent) {
    console.error("E-posta gönderilemedi (Resend)");
    process.exit(1);
  }

  console.log("Gönderildi.");
  console.log(`Promo kurs sayısı: ${promoCourses.length}`);
  console.log(
    "Not: Bu script kampanya gönderim tarihini işaretlemez (canlı batch etkilenmez).",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
