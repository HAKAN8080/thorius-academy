import Link from "next/link";
import type { ContextSetRow } from "@/types/yayinevi";

const statusLabel: Record<ContextSetRow["status"], string> = {
  draft: "Taslak",
  in_review: "İncelemede",
  approved: "Onaylı",
  rejected: "Reddedildi",
};

const statusClass: Record<ContextSetRow["status"], string> = {
  draft: "bg-slate-100 text-slate-700",
  in_review: "bg-amber-100 text-amber-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export function ContextSetList({ sets }: { sets: ContextSetRow[] }) {
  if (sets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <p className="text-slate-600">Henüz bağlam seti yok.</p>
        <Link
          href="/yayinevi/yeni"
          className="mt-4 inline-block rounded-lg bg-[#0B1E3F] px-4 py-2 text-sm font-medium text-white"
        >
          İlk seti üret
        </Link>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {sets.map((set) => (
        <li key={set.id}>
          <Link
            href={`/yayinevi/${set.id}`}
            className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0B1E3F]/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-[#0B1E3F]">{set.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                  {set.context_body}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusClass[set.status]}`}
              >
                {statusLabel[set.status]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
              <span>Zorluk: {set.difficulty}</span>
              {set.quality_score != null && (
                <span>MEB skor: {set.quality_score}</span>
              )}
              <span>
                {new Date(set.updated_at).toLocaleDateString("tr-TR")}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
