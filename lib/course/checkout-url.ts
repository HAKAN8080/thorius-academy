import { getWpSiteUrl } from "@/lib/config/portal-urls";

export interface CheckoutCustomer {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
}

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const trimmed = fullName.trim();
  if (!trimmed) {
    return { firstName: "", lastName: "" };
  }

  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function buildWooCommerceCheckoutUrl(
  wcProductId: number,
  customer?: CheckoutCustomer | null,
  options?: { returnUrl?: string | null },
): string {
  const checkoutBase = `${getWpSiteUrl()}/odeme/`;
  const url = new URL(checkoutBase);
  url.searchParams.set("add-to-cart", String(wcProductId));
  url.searchParams.set("quantity", "1");

  if (options?.returnUrl) {
    url.searchParams.set("thorius_return", options.returnUrl);
  }

  if (customer?.email) {
    url.searchParams.set("billing_email", customer.email);
  }
  if (customer?.firstName) {
    url.searchParams.set("billing_first_name", customer.firstName);
  }
  if (customer?.lastName) {
    url.searchParams.set("billing_last_name", customer.lastName);
  }
  if (customer?.phone) {
    url.searchParams.set("billing_phone", customer.phone);
  }

  return url.toString();
}
