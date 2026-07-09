# LGS Matematik AI Soru Editörü — Faz 1 Uygulama Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thorius yayınevi ekibinin MAT.8.1.1 için TYMM/MEB uyumlu bağlam + 2 soruluk set üretip onaylayabileceği `/yayinevi` editör panelini çalışır hale getirmek.

**Architecture:** Mevcut `thorius-academy` Next.js uygulamasına `/yayinevi` route grubu eklenir. TYMM Tema 1 verisi JSON seed + Supabase tabloları. AI üretimi server-side API route; çıktı Zod ile doğrulanır. Görsel için SVG tablo şablonu. Instructor `canManage` yetkisi ile korunur.

**Tech Stack:** Next.js 14, Supabase, TypeScript, Tailwind, OpenAI API (`openai` SDK), Zod (yeni dependency)

**Spec:** `docs/superpowers/specs/2026-07-09-lgs-matematik-ai-editor-design.md`

## Global Constraints

- Faz 1 kapsamı yalnızca öğrenme çıktısı `MAT.8.1.1` ve üretim akışı; MAT.8.1.2–8.1.4 yok.
- Hiçbir `context_sets` kaydı `approved` olmadan editör onayı alamaz (UI + server action).
- MEB yasakları: "Hepsi", "Hiçbiri", "Yukarıdakilerin hepsi/hiçbiri" şıkları üretilmemeli; validator reddetsin.
- Bağlam işlevsellik kuralı: AI `self_check.context_functional` döndürür; editör checklist'te onaylar.
- Auth: `requireInstructorLayoutAccess` / `getCurriculumAccess().canManage` — öğrenci erişemez.
- AI anahtarı yalnızca server env: `YAYINEVI_OPENAI_API_KEY`, `YAYINEVI_OPENAI_MODEL` (default `gpt-4.1-mini`).
- Türkçe UI metinleri; kod ve tipler İngilizce dosya/adlandırma (mevcut repo convention).
- PDF export, Kitaplık entegrasyonu, öğrenci uygulaması yok (Faz 3).

---

## Dosya Haritası

| Dosya | Sorumluluk |
|-------|------------|
| `supabase/migrations/20260709120000_yayinevi_context_sets.sql` | Tablolar + RLS |
| `lib/yayinevi/curriculum/grade-8-matematik-tema-1.json` | TYMM seed (Faz 1: tema + 8.1.1) |
| `lib/yayinevi/curriculum/types.ts` | Curriculum tipleri |
| `lib/yayinevi/curriculum/load-curriculum.ts` | JSON okuma |
| `lib/yayinevi/meb-checklist.ts` | 18 maddelik checklist + otomatik kontroller |
| `lib/yayinevi/validate-generation.ts` | Zod şema + yasak şık kontrolü |
| `lib/yayinevi/ai/prompt.ts` | System/user prompt oluşturma |
| `lib/yayinevi/ai/generate-context-set.ts` | OpenAI çağrısı |
| `lib/yayinevi/visual-templates/render-table-svg.ts` | Tablo SVG |
| `lib/yayinevi/repository.ts` | Supabase CRUD |
| `lib/actions/yayinevi-context-sets.ts` | Server actions |
| `app/api/yayinevi/generate/route.ts` | POST generate (auth) |
| `app/(app)/yayinevi/layout.tsx` | Auth guard |
| `app/(app)/yayinevi/page.tsx` | Liste |
| `app/(app)/yayinevi/yeni/page.tsx` | Üretim sihirbazı |
| `app/(app)/yayinevi/[id]/page.tsx` | Detay / onay |
| `components/yayinevi/yayinevi-shell.tsx` | Shell |
| `components/yayinevi/context-set-list.tsx` | Liste |
| `components/yayinevi/context-set-editor.tsx` | Düzenleme formu |
| `components/yayinevi/meb-checklist-panel.tsx` | Checklist UI |
| `components/yayinevi/visual-preview.tsx` | SVG önizleme |
| `scripts/verify-yayinevi-generation.ts` | Offline prompt/validate smoke test |
| `types/yayinevi.ts` | DB row tipleri |

---

### Task 1: Veritabanı şeması

**Files:**
- Create: `supabase/migrations/20260709120000_yayinevi_context_sets.sql`
- Create: `types/yayinevi.ts`

**Interfaces:**
- Produces: tablolar `publisher_curriculum_themes`, `publisher_learning_outcomes`, `publisher_process_components`, `publisher_context_sets`, `publisher_context_questions`
- Produces types: `ContextSetStatus`, `ContextSetRow`, `ContextQuestionRow`

- [ ] **Step 1: Migration yaz**

```sql
-- Yayinevi TYMM soru editörü — Faz 1

CREATE TYPE public.publisher_context_status AS ENUM (
  'draft', 'in_review', 'approved', 'rejected'
);

CREATE TYPE public.publisher_visual_type AS ENUM (
  'none', 'table', 'number_line'
);

CREATE TYPE public.publisher_difficulty AS ENUM (
  'kolay', 'orta', 'zor'
);

CREATE TABLE IF NOT EXISTS public.publisher_curriculum_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade SMALLINT NOT NULL,
  subject TEXT NOT NULL,
  theme_number SMALLINT NOT NULL,
  title TEXT NOT NULL,
  tymm_unit_url TEXT,
  area_skills JSONB NOT NULL DEFAULT '[]',
  conceptual_skills JSONB NOT NULL DEFAULT '[]',
  UNIQUE (grade, subject, theme_number)
);

CREATE TABLE IF NOT EXISTS public.publisher_learning_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  theme_id UUID NOT NULL REFERENCES public.publisher_curriculum_themes (id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_framework TEXT[] NOT NULL DEFAULT '{}',
  context_hints TEXT[] NOT NULL DEFAULT '{}',
  key_concepts TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS public.publisher_process_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES public.publisher_learning_outcomes (id) ON DELETE CASCADE,
  letter TEXT NOT NULL,
  description TEXT NOT NULL,
  UNIQUE (outcome_id, letter)
);

CREATE TABLE IF NOT EXISTS public.publisher_context_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id UUID NOT NULL REFERENCES public.publisher_learning_outcomes (id),
  process_component_id UUID NOT NULL REFERENCES public.publisher_process_components (id),
  title TEXT NOT NULL,
  context_body TEXT NOT NULL,
  visual_type public.publisher_visual_type NOT NULL DEFAULT 'none',
  visual_data JSONB,
  visual_svg TEXT,
  difficulty public.publisher_difficulty NOT NULL DEFAULT 'orta',
  source_note TEXT,
  status public.publisher_context_status NOT NULL DEFAULT 'draft',
  author_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  reviewer_notes TEXT,
  meb_checklist JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.publisher_context_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  context_set_id UUID NOT NULL REFERENCES public.publisher_context_sets (id) ON DELETE CASCADE,
  sort_order SMALLINT NOT NULL,
  stem TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  solution TEXT NOT NULL,
  distractor_rationale JSONB NOT NULL DEFAULT '{}',
  process_component_letter TEXT,
  UNIQUE (context_set_id, sort_order)
);

CREATE INDEX publisher_context_sets_author_idx ON public.publisher_context_sets (author_id, updated_at DESC);
CREATE INDEX publisher_context_sets_status_idx ON public.publisher_context_sets (status);

ALTER TABLE public.publisher_curriculum_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_learning_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_process_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_context_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publisher_context_questions ENABLE ROW LEVEL SECURITY;

-- Curriculum: authenticated read
CREATE POLICY "publisher_curriculum_read" ON public.publisher_curriculum_themes FOR SELECT TO authenticated USING (true);
CREATE POLICY "publisher_outcomes_read" ON public.publisher_learning_outcomes FOR SELECT TO authenticated USING (true);
CREATE POLICY "publisher_components_read" ON public.publisher_process_components FOR SELECT TO authenticated USING (true);

-- Context sets: author full access; service_role all
CREATE POLICY "publisher_context_sets_author" ON public.publisher_context_sets
  FOR ALL TO authenticated USING (auth.uid() = author_id) WITH CHECK (auth.uid() = author_id);

CREATE POLICY "publisher_context_questions_via_set" ON public.publisher_context_questions
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.publisher_context_sets s
      WHERE s.id = context_set_id AND s.author_id = auth.uid()
    )
  );

GRANT SELECT ON public.publisher_curriculum_themes TO authenticated;
GRANT SELECT ON public.publisher_learning_outcomes TO authenticated;
GRANT SELECT ON public.publisher_process_components TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publisher_context_sets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.publisher_context_questions TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
```

- [ ] **Step 2: `types/yayinevi.ts` ekle**

```typescript
export type ContextSetStatus = "draft" | "in_review" | "approved" | "rejected";
export type PublisherVisualType = "none" | "table" | "number_line";
export type PublisherDifficulty = "kolay" | "orta" | "zor";

export interface ContextQuestionOption {
  key: "A" | "B" | "C" | "D";
  text: string;
}

export interface ContextSetRow {
  id: string;
  outcome_id: string;
  process_component_id: string;
  title: string;
  context_body: string;
  visual_type: PublisherVisualType;
  visual_data: Record<string, unknown> | null;
  visual_svg: string | null;
  difficulty: PublisherDifficulty;
  source_note: string | null;
  status: ContextSetStatus;
  author_id: string;
  reviewer_notes: string | null;
  meb_checklist: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ContextQuestionRow {
  id: string;
  context_set_id: string;
  sort_order: number;
  stem: string;
  options: ContextQuestionOption[];
  correct_option: "A" | "B" | "C" | "D";
  solution: string;
  distractor_rationale: Record<string, string>;
  process_component_letter: string | null;
}
```

- [ ] **Step 3: Migration'ı local Supabase'e uygula (veya `supabase db push`)**

Run: `npx supabase db push` (veya projede kullanılan migration workflow)

Expected: tablolar oluşur, hata yok

---

### Task 2: TYMM curriculum seed (Tema 1 / MAT.8.1.1)

**Files:**
- Create: `lib/yayinevi/curriculum/types.ts`
- Create: `lib/yayinevi/curriculum/grade-8-matematik-tema-1.json`
- Create: `lib/yayinevi/curriculum/load-curriculum.ts`
- Create: `scripts/seed-yayinevi-curriculum.ts`

**Interfaces:**
- Produces: `loadGrade8MatematikTema1()` → `CurriculumTheme`
- Produces: `seedPublisherCurriculum()` — DB'ye upsert

- [ ] **Step 1: JSON seed oluştur** — `grade-8-matematik-tema-1.json` içeriği:
  - `theme`: Sayılar ve Nicelikler, `tymm_unit_url`: `https://tymm.meb.gov.tr/ortaokul-matematik-dersi/unite/472`
  - `outcomes`: yalnızca `MAT.8.1.1` (tam TYMM metni)
  - `processComponents`: a, b, c, ç, d (ünite 472'den)
  - `contextHints`: bakteri çoğalması, hafıza kartı KB/MB, deprem şiddeti, kâğıt ikiye katlama, hücre bölünmesi

- [ ] **Step 2: `load-curriculum.ts`**

```typescript
import tema1 from "./grade-8-matematik-tema-1.json";
import type { CurriculumTheme } from "./types";

export function loadGrade8MatematikTema1(): CurriculumTheme {
  return tema1 as CurriculumTheme;
}
```

- [ ] **Step 3: Seed script** — `scripts/seed-yayinevi-curriculum.ts` service_role ile theme + outcome + components upsert

Run: `npx tsx scripts/seed-yayinevi-curriculum.ts`

Expected: `MAT.8.1.1` ve 5 süreç bileşeni DB'de

---

### Task 3: MEB doğrulama ve checklist

**Files:**
- Create: `lib/yayinevi/meb-checklist.ts`
- Create: `lib/yayinevi/validate-generation.ts`
- Create: `scripts/verify-yayinevi-validation.ts`

**Interfaces:**
- Produces: `MEB_CHECKLIST_ITEMS` (18 madde id + label)
- Produces: `runAutomaticChecks(generation: GeneratedContextSet): MebChecklistResult`
- Produces: `validateGeneratedContextSet(json: unknown): GeneratedContextSet` (Zod)

- [ ] **Step 1: Zod şeması** — `validate-generation.ts`:

```typescript
import { z } from "zod";

const optionKey = z.enum(["A", "B", "C", "D"]);

export const generatedQuestionSchema = z.object({
  stem: z.string().min(20),
  options: z.record(optionKey, z.string().min(1)),
  correct: optionKey,
  solution: z.string().min(10),
  distractors: z.record(z.string(), z.string()),
});

export const generatedContextSetSchema = z.object({
  context_title: z.string().min(5),
  context_body: z.string().min(80),
  visual: z.object({
    type: z.enum(["none", "table"]),
    headers: z.array(z.string()).optional(),
    rows: z.array(z.array(z.union([z.string(), z.number()]))).optional(),
  }),
  questions: z.array(generatedQuestionSchema).min(2).max(4),
  self_check: z.object({
    context_functional: z.boolean(),
    no_hepsi_hicbiri: z.boolean(),
    option_length_balanced: z.boolean(),
  }),
});

export type GeneratedContextSet = z.infer<typeof generatedContextSetSchema>;

const FORBIDDEN_OPTION = /hepsi|hiçbiri|yukarıdakilerin/i;

export function assertNoForbiddenOptions(gen: GeneratedContextSet): string[] {
  const errors: string[] = [];
  for (const q of gen.questions) {
    for (const text of Object.values(q.options)) {
      if (FORBIDDEN_OPTION.test(text)) errors.push(`Yasak şık: ${text}`);
    }
  }
  return errors;
}
```

- [ ] **Step 2: `meb-checklist.ts`** — otomatik maddeler: yasak şık yok, 4 şık var, bağlam min uzunluk, self_check bayrakları

- [ ] **Step 3: Verify script**

Run: `npx tsx scripts/verify-yayinevi-validation.ts`

Expected: örnek geçerli/geçersiz JSON ile testler PASS (console)

- [ ] **Step 4: `npm install zod openai`**

---

### Task 4: Görsel tablo şablonu

**Files:**
- Create: `lib/yayinevi/visual-templates/render-table-svg.ts`
- Create: `lib/yayinevi/visual-templates/types.ts`

**Interfaces:**
- Produces: `renderTableSvg(data: { headers: string[]; rows: (string|number)[][] }): string`

- [ ] **Step 1: SVG renderer** — sade 2 sütunlu tablo, okunaklı font, Thorius renkleri (`#0B1E3F` header)

- [ ] **Step 2: Manuel smoke test**

```typescript
import { renderTableSvg } from "@/lib/yayinevi/visual-templates/render-table-svg";
const svg = renderTableSvg({
  headers: ["Saat", "Bakteri Sayısı"],
  rows: [[0, 1], [1, 3], [2, 9]],
});
console.log(svg.includes("<svg") && svg.includes("Bakteri"));
```

Expected: `true`

---

### Task 5: AI üretim pipeline

**Files:**
- Create: `lib/yayinevi/ai/prompt.ts`
- Create: `lib/yayinevi/ai/generate-context-set.ts`
- Create: `app/api/yayinevi/generate/route.ts`
- Modify: `.env.example` — `YAYINEVI_OPENAI_API_KEY`, `YAYINEVI_OPENAI_MODEL`

**Interfaces:**
- Consumes: `loadGrade8MatematikTema1`, `validateGeneratedContextSet`, `assertNoForbiddenOptions`
- Produces: `generateContextSet(input: GenerateInput): Promise<GeneratedContextSet>`
- API: `POST /api/yayinevi/generate` body `{ outcomeCode, processComponentLetter, difficulty?, contextTheme? }`

- [ ] **Step 1: `prompt.ts`** — system prompt: MEB bağlam temelli kurallar (özet), JSON-only çıktı, yasak şıklar, MAT.8.1.1 + seçilen SB metni, context_hints

- [ ] **Step 2: `generate-context-set.ts`** — OpenAI `response_format: { type: "json_object" }`, parse + Zod + forbidden check

- [ ] **Step 3: API route** — `getCurriculumAccess()` canManage guard, 429 basit rate limit (in-memory veya başına 10/saat)

- [ ] **Step 4: `.env.example` güncelle**

- [ ] **Step 5: Smoke test (API key varsa)**

Run: `curl -X POST http://localhost:3000/api/yayinevi/generate -H "Cookie: ..." -d '{"outcomeCode":"MAT.8.1.1","processComponentLetter":"c","difficulty":"orta"}'`

Expected: 200 + geçerli JSON (veya 401 oturum yoksa)

---

### Task 6: Repository ve server actions

**Files:**
- Create: `lib/yayinevi/repository.ts`
- Create: `lib/actions/yayinevi-context-sets.ts`

**Interfaces:**
- Produces: `createContextSetFromGeneration(userId, outcomeId, componentId, gen, svg)`
- Produces: `listContextSetsForAuthor(userId)`
- Produces: `getContextSetDetail(id, userId)`
- Produces: `updateContextSetDraft(...)`, `submitContextSetForReview(id)`, `approveContextSet(id, checklist)`, `rejectContextSet(id, notes)`

- [ ] **Step 1: repository.ts** — Supabase admin veya server client

- [ ] **Step 2: server actions** — `approve` yalnızca checklist'te zorunlu otomatik maddeler `pass` ise; `revalidatePath('/yayinevi')`

---

### Task 7: Editör UI

**Files:**
- Create: `app/(app)/yayinevi/layout.tsx`
- Create: `app/(app)/yayinevi/page.tsx`
- Create: `app/(app)/yayinevi/yeni/page.tsx`
- Create: `app/(app)/yayinevi/[id]/page.tsx`
- Create: `components/yayinevi/yayinevi-shell.tsx`
- Create: `components/yayinevi/context-set-list.tsx`
- Create: `components/yayinevi/context-set-wizard.tsx`
- Create: `components/yayinevi/context-set-editor.tsx`
- Create: `components/yayinevi/meb-checklist-panel.tsx`
- Create: `components/yayinevi/visual-preview.tsx`
- Modify: `components/instructor/instructor-shell.tsx` — nav'a "Yayınevi" linki (opsiyonel) veya ayrı shell

**Interfaces:**
- Consumes: server actions, `loadGrade8MatematikTema1` (yeni sayfa select'leri)

- [ ] **Step 1: layout.tsx** — `requireInstructorLayoutAccess()`

- [ ] **Step 2: Liste sayfası** — durum badge, başlık, kazanım kodu, tarih

- [ ] **Step 3: Yeni sayfa sihirbazı**
  1. MAT.8.1.1 (sabit, Faz 1)
  2. Süreç bileşeni dropdown
  3. Zorluk + isteğe bağlı bağlam teması
  4. "Üret" → API → redirect `/yayinevi/[id]`

- [ ] **Step 4: Detay sayfası** — bağlam metni düzenleme, sorular, SVG önizleme, checklist paneli, Onayla / Reddet / Taslak kaydet

- [ ] **Step 5: `npm run build`**

Run: `npm run build`

Expected: build başarılı

---

## Manuel Test Planı (Faz 1 kabul)

1. Instructor hesabıyla `/yayinevi` açılır
2. Yeni set: MAT.8.1.1 / (c) / orta → AI üretir
3. Tablo SVG görünür, 2 soru 4 şıklı
4. Checklist uyarıları görünür
5. Onayla → status `approved`, listede görünür
6. Oturumsuz `/yayinevi` → login redirect

---

## Spec Self-Review

| Spec gereksinimi | Task |
|------------------|------|
| MAT.8.1.1 only | Task 2, 5, 7 |
| MEB checklist | Task 3, 7 |
| Editör onayı zorunlu | Task 6, 7 |
| Tablo SVG | Task 4 |
| `/yayinevi` panel | Task 7 |
| AI server-side | Task 5 |
| canManage auth | Task 5, 7 |

Gaps: none for Faz 1 scope.

---

## Execution Handoff

Plan kaydedildi. Uygulama seçenekleri:

1. **Subagent-Driven** — görev başına ayrı subagent, arada review
2. **Inline Execution** — bu oturumda Task 1'den başlayarak sırayla kodlama

Hangisiyle devam edelim?
