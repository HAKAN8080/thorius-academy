import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildLoginRedirectPath } from "@/lib/auth/protected-paths";
import { canAccessYayinevi } from "@/lib/yayinevi/access";
import { createClient } from "@/lib/supabase/server";

export async function requireYayineviAccess(): Promise<{
  userId: string;
  email: string;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) {
    const headerStore = await headers();
    const pathname = headerStore.get("x-pathname") ?? "/yayinevi";
    redirect(buildLoginRedirectPath(pathname));
  }

  const email = user.email?.trim() ?? "";
  if (!canAccessYayinevi(email)) {
    redirect("/panel");
  }

  return { userId: user.id, email };
}
