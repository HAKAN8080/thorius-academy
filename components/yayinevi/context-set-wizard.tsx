"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateContextSetAction } from "@/lib/actions/yayinevi-context-sets";
import { getActiveOutcomes } from "@/lib/yayinevi/curriculum/load-curriculum";
import type { PublisherDifficulty } from "@/types/yayinevi";

const outcome = getActiveOutcomes()[0];
const components = outcome?.processComponents ?? [];

const contextThemes = [
  "Bakteri çoğalması",
  "Hafıza kartı (KB/MB)",
  "Kâğıt katlama",
  "Hücre bölünmesi",
];

export function ContextSetWizard() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [letter, setLetter] = useState("c");
  const [difficulty, setDifficulty] = useState<PublisherDifficulty>("orta");
  const [contextTheme, setContextTheme] = useState(contextThemes[0]);

  function handleGenerate() {
    setError(null);
    startTransition(async () => {
      const result = await generateContextSetAction({
        outcomeCode: outcome.code,
        processComponentLetter: letter,
        difficulty,
        contextTheme,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/yayinevi/${result.id}`);
    });
  }

  return (
    <div className="max-w-xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-lg font-semibold text-[#0B1E3F]">Yeni bağlam seti</h2>
        <p className="mt-1 text-sm text-slate-600">
          Orchestrator: bağlam → soru → çeldirici → MEB kontrol → insan onayı
        </p>
      </div>

      <div className="space-y-4 text-sm">
        <div>
          <label className="font-medium text-slate-700">Öğrenme çıktısı</label>
          <p className="mt-1 rounded-lg bg-slate-50 p-3 text-slate-800">
            {outcome.code} — {outcome.title}
          </p>
        </div>

        <div>
          <label htmlFor="sb" className="font-medium text-slate-700">
            Süreç bileşeni
          </label>
          <select
            id="sb"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {components.map((c) => (
              <option key={c.letter} value={c.letter}>
                ({c.letter}) {c.description.slice(0, 80)}…
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="theme" className="font-medium text-slate-700">
            Bağlam teması
          </label>
          <select
            id="theme"
            value={contextTheme}
            onChange={(e) => setContextTheme(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            {contextThemes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="diff" className="font-medium text-slate-700">
            Zorluk
          </label>
          <select
            id="diff"
            value={difficulty}
            onChange={(e) =>
              setDifficulty(e.target.value as PublisherDifficulty)
            }
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          >
            <option value="kolay">Kolay</option>
            <option value="orta">Orta</option>
            <option value="zor">Zor</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={pending}
        onClick={handleGenerate}
        className="w-full rounded-lg bg-[#0B1E3F] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Pipeline çalışıyor (6 agent)…" : "AI ile üret"}
      </button>
    </div>
  );
}
