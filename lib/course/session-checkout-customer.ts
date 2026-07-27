import { cache } from "react";
import {
  splitFullName,
  type CheckoutCustomer,
} from "@/lib/course/checkout-url";
import { createClient } from "@/lib/supabase/server";

/** Shared checkout prefill from the logged-in Supabase session. */
export const getSessionCheckoutCustomer = cache(
  async (): Promise<CheckoutCustomer | null> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return null;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .maybeSingle();

    const metadataName =
      typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : "";
    const { firstName, lastName } = splitFullName(
      profile?.full_name ?? metadataName,
    );

    return {
      email: user.email,
      firstName,
      lastName,
      phone: profile?.phone ?? null,
    };
  },
);
