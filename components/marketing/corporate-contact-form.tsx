"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import {
  submitCorporateContact,
  type CorporateContactState,
} from "@/lib/actions/corporate-contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: CorporateContactState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  const t = useTranslations("corporate.form");

  return (
    <Button type="submit" variant="gold" className="w-full" disabled={pending}>
      {pending ? t("submitting") : t("submit")}
    </Button>
  );
}

export function CorporateContactForm() {
  const t = useTranslations("corporate.form");
  const [state, formAction] = useFormState(submitCorporateContact, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-4">
      {state.error && (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && state.successMessage && (
        <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
          {state.successMessage}
        </p>
      )}
      <div className="space-y-2">
        <Label htmlFor="company">{t("company")}</Label>
        <Input
          id="company"
          name="company"
          required
          placeholder={t("companyPlaceholder")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-name">{t("contactName")}</Label>
        <Input id="contact-name" name="contactName" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="contact-email">{t("contactEmail")}</Label>
        <Input id="contact-email" name="contactEmail" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="employees">{t("employees")}</Label>
        <Input
          id="employees"
          name="employees"
          type="number"
          min={1}
          placeholder={t("employeesPlaceholder")}
        />
      </div>
      <SubmitButton />
    </form>
  );
}
