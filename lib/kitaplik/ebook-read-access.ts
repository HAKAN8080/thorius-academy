import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
import { userHasEbookEntitlement } from "@/lib/kitaplik/repository";

export function hasKitaplikAdminReadAllAccess(
  email: string | null | undefined,
): boolean {
  return canAccessKitaplikAdmin(email);
}

export async function userCanReadKitaplikEbook(
  userId: string,
  userEmail: string | null | undefined,
  libraryBookId: string,
): Promise<boolean> {
  if (hasKitaplikAdminReadAllAccess(userEmail)) {
    return true;
  }

  return userHasEbookEntitlement(userId, libraryBookId);
}
