export function getCertificateVerifyUrl(certificateId: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    "https://academy.thorius.com.tr";

  return `${siteUrl}/belge/dogrula/${certificateId}`;
}
