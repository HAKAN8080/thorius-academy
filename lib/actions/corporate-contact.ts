"use server";

import { getTranslations } from "next-intl/server";
import { getResendClient, getResendFromAddress } from "@/lib/resend/client";

export interface CorporateContactState {
  error?: string;
  success?: boolean;
  successMessage?: string;
}

export async function submitCorporateContact(
  _prevState: CorporateContactState,
  formData: FormData,
): Promise<CorporateContactState> {
  const t = await getTranslations("corporate.form");
  const company = formData.get("company");
  const contactName = formData.get("contactName");
  const contactEmail = formData.get("contactEmail");
  const employees = formData.get("employees");

  if (
    typeof company !== "string" ||
    !company.trim() ||
    typeof contactName !== "string" ||
    !contactName.trim() ||
    typeof contactEmail !== "string" ||
    !contactEmail.trim()
  ) {
    return { error: t("errorRequired") };
  }

  const employeeCount =
    typeof employees === "string" && employees.trim() ? employees.trim() : "-";

  try {
    const resend = getResendClient();
    const to = process.env.CORPORATE_CONTACT_EMAIL ?? "info@thorius.com.tr";

    const { error } = await resend.emails.send({
      from: getResendFromAddress(),
      to,
      replyTo: contactEmail.trim(),
      subject: t("emailSubject", { company: company.trim() }),
      html: `
        <h2>${t("emailHeading")}</h2>
        <p><strong>${t("emailCompany")}:</strong> ${company.trim()}</p>
        <p><strong>${t("emailName")}:</strong> ${contactName.trim()}</p>
        <p><strong>${t("emailEmail")}:</strong> ${contactEmail.trim()}</p>
        <p><strong>${t("emailEmployees")}:</strong> ${employeeCount}</p>
      `,
    });

    if (error) {
      console.error("[Corporate Contact] Email failed:", error.message);
      return { error: t("errorSend") };
    }

    return {
      success: true,
      successMessage: t("success"),
    };
  } catch (err) {
    console.error("[Corporate Contact] Exception:", err);
    return { error: t("errorSend") };
  }
}
