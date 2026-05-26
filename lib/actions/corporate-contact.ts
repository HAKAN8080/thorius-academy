"use server";

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
    return { error: "Lütfen zorunlu alanları doldurun." };
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
      subject: `Kurumsal teklif talebi — ${company.trim()}`,
      html: `
        <h2>Kurumsal İletişim Formu</h2>
        <p><strong>Şirket:</strong> ${company.trim()}</p>
        <p><strong>Ad Soyad:</strong> ${contactName.trim()}</p>
        <p><strong>E-posta:</strong> ${contactEmail.trim()}</p>
        <p><strong>Çalışan sayısı:</strong> ${employeeCount}</p>
      `,
    });

    if (error) {
      console.error("[Corporate Contact] Email failed:", error.message);
      return {
        error: "Form gönderilemedi. Lütfen info@thorius.com.tr adresine yazın.",
      };
    }

    return {
      success: true,
      successMessage:
        "Talebiniz alındı. Ekibimiz 1 iş günü içinde size dönüş yapacaktır.",
    };
  } catch (err) {
    console.error("[Corporate Contact] Exception:", err);
    return {
      error: "Form gönderilemedi. Lütfen info@thorius.com.tr adresine yazın.",
    };
  }
}
