"use client";

import { useTransition } from "react";
import {
  approveContextSetAction,
  rejectContextSetAction,
  submitForReviewAction,
} from "@/lib/actions/yayinevi-context-sets";
import { MEB_CHECKLIST_ITEMS } from "@/lib/yayinevi/meb-checklist";
import type { ContextSetWithQuestions } from "@/types/yayinevi";

export function ContextSetDetailView({ set }: { set: ContextSetWithQuestions }) {
  const [pending, startTransition] = useTransition();
  const checklist = (set.meb_checklist ?? {}) as Record<string, boolean>;

  function run(action: () => Promise<unknown>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#D4AF37]">
            {set.outcome_code} · SB {set.process_component_letter}
          </p>
          <h1 className="text-2xl font-bold text-[#0B1E3F]">{set.title}</h1>
          <p className="mt-2 text-sm text-slate-500">
            Durum: {set.status}
            {set.quality_score != null && ` · MEB skor: ${set.quality_score}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {set.status === "draft" && (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => submitForReviewAction(set.id))}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
            >
              İncelemeye gönder
            </button>
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() => approveContextSetAction(set.id, checklist))
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
          >
            Onayla
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              run(() => rejectContextSetAction(set.id, "Revizyon gerekli"))
            }
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
          >
            Reddet
          </button>
        </div>
      </header>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-[#0B1E3F]">Bağlam</h2>
        <p className="mt-3 whitespace-pre-wrap text-slate-700 leading-relaxed">
          {set.context_body}
        </p>
        {set.visual_svg && (
          <div
            className="mt-6 overflow-x-auto rounded-lg border bg-slate-50 p-4"
            dangerouslySetInnerHTML={{ __html: set.visual_svg }}
          />
        )}
      </section>

      <section className="space-y-6">
        <h2 className="font-semibold text-[#0B1E3F]">Sorular</h2>
        {set.questions.map((q, i) => (
          <article
            key={q.id}
            className="rounded-xl border bg-white p-6"
          >
            <p className="font-medium text-[#0B1E3F]">
              {i + 1}. {q.stem}
            </p>
            <ul className="mt-4 space-y-2">
              {q.options.map((opt) => (
                <li
                  key={opt.key}
                  className={`rounded-lg px-3 py-2 text-sm ${
                    opt.key === q.correct_option
                      ? "bg-emerald-50 font-medium text-emerald-900"
                      : "bg-slate-50 text-slate-700"
                  }`}
                >
                  <span className="font-semibold">{opt.key})</span> {opt.text}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              <span className="font-medium">Çözüm:</span> {q.solution}
            </p>
          </article>
        ))}
      </section>

      <section className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold text-[#0B1E3F]">MEB Kontrol Listesi</h2>
        <ul className="mt-4 space-y-2">
          {MEB_CHECKLIST_ITEMS.map((item) => (
            <li key={item.id} className="flex items-center gap-2 text-sm">
              <span
                className={`h-2 w-2 rounded-full ${
                  checklist[item.id] ? "bg-emerald-500" : "bg-red-400"
                }`}
              />
              {item.label}
            </li>
          ))}
        </ul>
      </section>

      {set.pipeline_log?.length > 0 && (
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-semibold text-[#0B1E3F]">Pipeline günlüğü</h2>
          <ol className="mt-4 space-y-2 text-sm text-slate-600">
            {set.pipeline_log.map((entry, i) => (
              <li key={`${entry.at}-${i}`}>
                <span className="font-mono text-xs text-[#D4AF37]">
                  {entry.agent}
                </span>
                {" — "}
                {entry.summary}
                {entry.score != null && ` (${entry.score})`}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}
