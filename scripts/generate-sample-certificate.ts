import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { generateCertificatePdf } from "@/lib/certificate/generate-pdf";
import { getCertificateVerifyUrl } from "@/lib/certificate/verify-url";

async function main() {
  const outputPath = join(process.cwd(), "sample-katilim-belgesi.pdf");
  const certificateId = randomUUID();

  const buffer = await generateCertificatePdf({
    fullName: "Ela Deniz Uğur",
    courseTitle: "Perakende Planlama ve Tahmin",
    completionDate: new Date("2026-05-23"),
    certificateId,
    verifyUrl: getCertificateVerifyUrl(certificateId),
  });

  writeFileSync(outputPath, buffer);
  console.log(`Saved: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
