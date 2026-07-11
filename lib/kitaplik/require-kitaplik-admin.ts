import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildLoginRedirectPath } from "@/lib/auth/protected-paths";
import { canAccessKitaplikAdmin } from "@/lib/kitaplik/access";
import { createClient } from "@/lib/supabase/server";

export async function requireKitaplikAdmin(): Promise<{
  userId: string;
  email: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-pathname") ?? "/kitaplik-yonetim";
    redirect(buildLoginRedirectPath(pathname));
  }

  const email = user.email?.trim() ?? "";
  if (!canAccessKitaplikAdmin(email)) {
    redirect("/");
  }

  return { userId: user.id, email };
}
