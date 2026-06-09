import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateDocument } from "../lib/certificate/certificate-document.tsx";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outputPath = join(__dirname, "..", "sample-katilim-belgesi.pdf");

const buffer = await renderToBuffer(
  React.createElement(CertificateDocument, {
    data: {
      fullName: "Ela Deniz Uğur",
      courseTitle: "Perakende Planlama ve Tahmin",
      completionDate: new Date("2026-05-23"),
    },
  }),
);

writeFileSync(outputPath, Buffer.from(buffer));
console.log(`Saved: ${outputPath}`);
