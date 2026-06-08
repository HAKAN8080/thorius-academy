import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateCertificatePdf } from "@/lib/certificate/generate-pdf";

async function main() {
  const outputPath = join(process.cwd(), "sample-katilim-belgesi.pdf");

  const buffer = await generateCertificatePdf({
    fullName: "Ela Deniz Uğur",
    courseTitle: "Perakende Planlama ve Tahmin",
    completionDate: new Date("2026-05-23"),
  });

  writeFileSync(outputPath, buffer);
  console.log(`Saved: ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
