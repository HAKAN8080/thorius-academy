# Kitaplik homepage redesign — Konu?an Kitaplar

Date: 2026-07-18  
Status: approved for planning  
Scope: homepage + book cards + header (kitaplik.thorius.com.tr)

## Goal

Reposition the Kitaplik storefront around the new read-along audiobook feature without changing purchase, entitlement, or player logic. Brand the experience as **Konu?an Kitaplar** while keeping bas?l? + e-kitap clear.

## Decisions

- Slogan: **Konu?an Kitaplar** (emotional, story-first)
- Approach: **B — story-led refresh** (not a full cinematic collage redesign)
- Visual system: keep existing Thorius Kitaplik tokens (navy primary, gold/accent). Do not introduce purple gradients or a new color system.
- Audiobook availability: derived from existing `getAudiobookManifest(slug)` (manifest present ? sesli)

## Out of scope

- Changes to `/dinle` or `/oku` player UX
- New WooCommerce products or pricing for audio (audio remains bundled with e-kitap entitlement)
- New CMS fields for slogan/copy
- Academy / company site homepage

## Information architecture

### Header (`KitaplikHeader` + logo area)

- Keep existing nav links and auth CTA.
- Add a compact brand line near the logo: **Konu?an Kitaplar** (small, secondary to logo).
- Optional: no new nav item for “Sesli”; discovery stays on home + book cards.

### Homepage (`KitaplikHomePage`)

1. **Hero**
   - Eyebrow: `THORIUS K?TAPLI?I`
   - H1: `Konu?an Kitaplar`
   - Supporting sentence (~1 line): kelime takipli sesli okuma; bas?l? ve e-kitap da ayn? rafta.
   - CTAs: primary “Kitaplar? ke?fet” (anchor/scroll to grid), secondary “Kitaplar?m”.
   - First viewport stays lean: brand + headline + one sentence + CTA group. No stats strip, no card grid inside hero.

2. **Format strip** (one job: explain formats)
   - Three short items: Bas?l? · E-kitap · Sesli
   - Sesli copy mentions word-highlight / read-along in plain language.

3. **Books grid**
   - Same published catalog source as today.
   - Section title can stay “Kitaplar” or become “Raftaki kitaplar”; keep count.
   - Cards show sesli badge when manifest exists.

### Book card (`KitaplikBookCard`)

- Overlay or corner badge: headphones icon + `Sesli` when audiobook manifest exists for `book.slug`.
- Pricing lines unchanged (Bas?l? / E-kitap).
- No separate “Dinle” CTA on the card (detail page already has Oku / Sesli Dinle for entitled users). Card remains a link to `/kitap/[slug]`.

## Data / plumbing

- Homepage (and cards) need a cheap `hasAudiobook` flag per book.
- Preferred: parallel `getAudiobookManifest(slug)` for published books (already cached/null-safe), or a small helper `listAudiobookSlugs()` that checks manifests for the current list.
- Do not download chapter audio on the homepage.

## Copy (TR)

- Hero H1: `Konu?an Kitaplar`
- Hero body: `Kelimeleri takip ederek dinleyin. Bas?l? sipari?, güvenli e-kitap ve sesli okuma — ayn? Thorius raf?nda.`
- Format labels: `Bas?l?` / `E-kitap` / `Sesli`
- Sesli blurb: `Kelime kelime vurgulu dinleme`
- Card badge: `Sesli`
- Header tagline: `Konu?an Kitaplar`

## Success criteria

- On first load of `/`, visitor immediately sees **Konu?an Kitaplar** as the hero message.
- Books with uploaded audio show a **Sesli** badge on the home grid without opening the detail page.
- Header still feels like Thorius Kitaplik; slogan does not overpower the logo.
- Mobile: hero readable without clutter; badge visible on cards; header tagline may hide below `sm` if space is tight.
- No regression to purchase/entitlement flows.

## Risks

- Manifest checks for every book on home: keep lightweight (download tiny `manifest.json` only); if catalog grows large, add a DB flag later.
- Encoding: avoid non-ASCII corruption in source files (use escapes or carefully verified UTF-8).
