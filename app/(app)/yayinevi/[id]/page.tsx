import { notFound } from "next/navigation";
import { getContextSetAction } from "@/lib/actions/yayinevi-context-sets";
import { ContextSetDetailView } from "@/components/yayinevi/context-set-detail";

export const dynamic = "force-dynamic";

export default async function YayineviDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const set = await getContextSetAction(id);
  if (!set) notFound();

  return <ContextSetDetailView set={set} />;
}
