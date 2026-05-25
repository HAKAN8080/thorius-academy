import crypto from "crypto";

export function verifyWooCommerceWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload, "utf8")
    .digest("base64");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}
