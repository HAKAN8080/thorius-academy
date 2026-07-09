import { requireYayineviAccess } from "@/lib/yayinevi/require-yayinevi-access";
import { YayineviShell } from "@/components/yayinevi/yayinevi-shell";

export const dynamic = "force-dynamic";

export default async function YayineviLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireYayineviAccess();
  return <YayineviShell>{children}</YayineviShell>;
}
