import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCareerPathProduct } from "@/lib/actions/career-path-products";
import { splitFullName } from "@/lib/course/checkout-url";
import type { CheckoutCustomer } from "@/lib/course/checkout-url";
import type { CareerPathProduct } from "@/types/career-path-product";

export interface CareerPathPurchaseState {
  isLoggedIn: boolean;
  pathProduct: CareerPathProduct | null;
  customer: CheckoutCustomer | null;
}

export const getCareerPathPurchaseState = cache(
  async (pathSlug: string): Promise<CareerPathPurchaseState> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const pathProduct = await getCareerPathProduct(pathSlug);

    let customer: CheckoutCustomer | null = null;
    if (user?.email) {
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

      customer = {
        email: user.email,
        firstName,
        lastName,
        phone: profile?.phone ?? null,
      };
    }

    return {
      isLoggedIn: Boolean(user),
      pathProduct,
      customer,
    };
  },
);
