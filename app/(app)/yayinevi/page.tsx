import { listContextSetsAction } from "@/lib/actions/yayinevi-context-sets";
import { ContextSetList } from "@/components/yayinevi/context-set-list";

export const dynamic = "force-dynamic";

export default async function YayineviPage() {
  const sets = await listContextSetsAction();

  return (
    <div>
      <ContextSetList sets={sets} />
    </div>
  );
}
