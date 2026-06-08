import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateDocument } from "@/lib/certificate/certificate-document";
import type { CertificateData } from "@/lib/certificate/types";

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Buffer> {
  const buffer = await renderToBuffer(
    <CertificateDocument data={data} />,
  );
  return Buffer.from(buffer);
}
