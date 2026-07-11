import { cache } from "react";
import { splitFullName } from "@/lib/course/checkout-url";
import type { CheckoutCustomer } from "@/lib/course/checkout-url";
import {
  hasKitaplikAdminReadAllAccess,
  userCanReadKitaplikEbook,
} from "@/lib/kitaplik/ebook-read-access";
import { enrichLibraryBookPricing } from "@/lib/kitaplik/fetch-wc-pricing";
import { getLibraryBookBySlug } from "@/lib/kitaplik/repository";
import type { LibraryBookWithPricing } from "@/lib/kitaplik/types";
import { createClient } from "@/lib/supabase/server";

export interface KitaplikBookPurchaseState {
  isLoggedIn: boolean;
  hasEbookAccess: boolean;
  customer: CheckoutCustomer | null;
  book: LibraryBookWithPricing | null;
}

export const getKitaplikBookPurchaseState = cache(
  async (slug: string): Promise<KitaplikBookPurchaseState> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const isAdminReader = hasKitaplikAdminReadAllAccess(user?.email);
    const bookRow = await getLibraryBookBySlug(slug, {
      includeUnpublished: isAdminReader,
    });
    const book = bookRow ? await enrichLibraryBookPricing(bookRow) : null;

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

    const hasEbookAccess =
      Boolean(user && book?.ebook_storage_path) &&
      (await userCanReadKitaplikEbook(user!.id, user!.email, book!.id));

    return {
      isLoggedIn: Boolean(user),
      hasEbookAccess,
      customer,
      book,
    };
  },
);
