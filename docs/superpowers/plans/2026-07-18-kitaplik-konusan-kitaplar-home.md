# Kitaplik Konu?an Kitaplar Home Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign kitaplik.thorius.com.tr homepage, book cards, and header around the slogan **Konu?an Kitaplar**, showing a Sesli badge when an audiobook manifest exists.

**Architecture:** Keep existing Thorius Kitaplik tokens and catalog data. Enrich published books with a cheap `hasAudiobook` flag via `getAudiobookManifest`. Refresh hero + format strip + header tagline; badge on cards only.

**Tech Stack:** Next.js App Router, React Server Components, existing `lib/kitaplik/*`, Lucide icons, Tailwind.

## Global Constraints

- Slogan copy: `Konu?an Kitaplar` (verbatim)
- Hero body: `Kelimeleri takip ederek dinleyin. Bas?l? sipari?, güvenli e-kitap ve sesli okuma — ayn? Thorius raf?nda.`
- Card badge: `Sesli`; format labels: `Bas?l?` / `E-kitap` / `Sesli`
- Preserve navy/gold Kitaplik palette; no purple theme
- Do not change `/dinle`, `/oku`, checkout, or entitlement logic
- Source files must be valid UTF-8

## File map

| File | Role |
|------|------|
| `lib/kitaplik/audiobook-access.ts` | Existing manifest helper (reuse) |
| `components/kitaplik/kitaplik-home-page.tsx` | Hero + format strip + grid |
| `components/kitaplik/kitaplik-book-card.tsx` | Sesli badge |
| `components/kitaplik/kitaplik-header.tsx` | Tagline near logo |
| `components/kitaplik/kitaplik-logo.tsx` | Optional tagline slot under/beside logo |

---

### Task 1: Enrich home books with `hasAudiobook`

**Files:**
- Modify: `components/kitaplik/kitaplik-home-page.tsx`
- Modify: `components/kitaplik/kitaplik-book-card.tsx`

**Interfaces:**
- Consumes: `getAudiobookManifest(slug): Promise<AudiobookManifest | null>`
- Produces: card prop `hasAudiobook: boolean`

- [ ] **Step 1:** After loading published books, resolve manifests in parallel:

```ts
const audiobookFlags = await Promise.all(
  books.map(async (book) => [book.slug, Boolean(await getAudiobookManifest(book.slug))] as const),
);
const hasAudiobookBySlug = Object.fromEntries(audiobookFlags);
```

- [ ] **Step 2:** Pass `hasAudiobook={Boolean(hasAudiobookBySlug[book.slug])}` into each card.
- [ ] **Step 3:** Verify locally that Pofi TR/EN and Tellus resolve `true` when manifests exist.

---

### Task 2: Redesign homepage hero + format strip

**Files:**
- Modify: `components/kitaplik/kitaplik-home-page.tsx`

- [ ] **Step 1:** Replace hero copy with eyebrow `THORIUS K?TAPLI?I`, H1 `Konu?an Kitaplar`, approved body sentence.
- [ ] **Step 2:** Add CTAs: `#kitaplik-books` (“Kitaplar? ke?fet”) and `/kitaplarim` (“Kitaplar?m”).
- [ ] **Step 3:** Add three-item format strip (Bas?l? / E-kitap / Sesli) between hero and grid; one short line each.
- [ ] **Step 4:** Keep books grid section id `kitaplik-books` for anchor; preserve empty/error states.
- [ ] **Step 5:** Smoke-check mobile: first viewport is brand + headline + sentence + CTAs only.

---

### Task 3: Sesli badge on book cards

**Files:**
- Modify: `components/kitaplik/kitaplik-book-card.tsx`

- [ ] **Step 1:** Accept optional `hasAudiobook?: boolean`.
- [ ] **Step 2:** When true, show corner badge on cover: Headphones icon + `Sesli`.
- [ ] **Step 3:** Keep card as single link to `/kitap/[slug]`; do not add Dinle button on card.

---

### Task 4: Header tagline

**Files:**
- Modify: `components/kitaplik/kitaplik-logo.tsx` and/or `components/kitaplik/kitaplik-header.tsx`

- [ ] **Step 1:** Add compact `Konu?an Kitaplar` text under/beside logo (secondary to logo).
- [ ] **Step 2:** Hide tagline below `sm` if header overflows; keep nav/auth unchanged.
- [ ] **Step 3:** Visual check: logo remains primary brand mark.

---

### Task 5: Verify + ship

- [ ] **Step 1:** `npx tsc --noEmit` / build path for touched files; fix UTF-8 if needed.
- [ ] **Step 2:** Commit and push to `main`.
- [ ] **Step 3:** Confirm on deploy: home hero, Sesli badges, header tagline.
