import { Resend } from "resend";

function getResendApiKey(): string {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is required");
  }
  return process.env.RESEND_API_KEY;
}

let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    resendClient = new Resend(getResendApiKey());
  }
  return resendClient;
}

export function getResendFromAddress(): string {
  return (
    process.env.RESEND_FROM_EMAIL ??
    "Thorius Academy <onboarding@resend.dev>"
  );
}
