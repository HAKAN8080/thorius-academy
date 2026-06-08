import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificateDocument } from "@/lib/certificate/certificate-document";
import { createCertificateQrDataUrl } from "@/lib/certificate/qr-code";
import { registerCertificateFonts } from "@/lib/certificate/register-fonts";
import type { CertificateData } from "@/lib/certificate/types";

export async function generateCertificatePdf(
  data: CertificateData,
): Promise<Buffer> {
  registerCertificateFonts();

  const qrDataUrl = await createCertificateQrDataUrl(data.verifyUrl);
  const buffer = await renderToBuffer(
    <CertificateDocument data={{ ...data, qrDataUrl }} />,
  );
  return Buffer.from(buffer);
}
