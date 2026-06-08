import QRCode from "qrcode";

export async function createCertificateQrDataUrl(
  verifyUrl: string,
): Promise<string> {
  return QRCode.toDataURL(verifyUrl, {
    margin: 0,
    width: 180,
    color: {
      dark: "#0B1E3F",
      light: "#FFFFFF",
    },
  });
}
