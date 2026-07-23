# Purchase Attribution + UTM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make paid acquisition measurable: fire GA4 `purchase` + Meta `Purchase` once per order, preserve UTM across Academy → WP checkout → thank-you.

**Architecture:** WooCommerce always redirects successful payments to `academy.thorius.com.tr/tesekkurler` with `order_id`, `value`, `currency`, `content_ids`, and optional `next` (post-thank-you destination). Client fires conversion once (sessionStorage dedupe). Buy buttons append stored UTMs to checkout URLs; `thorius_return` means *next after thank-you*, not the thank-you page itself.

**Tech Stack:** Next 14, existing `lib/analytics/tracking.ts`, WP plugin `wordpress/thorius-checkout`.

---

### Task 1: Tracking helpers (UTM + Purchase)

**Files:**
- Create: `lib/analytics/utm.ts`
- Modify: `lib/analytics/tracking.ts`
- Create: `components/analytics/utm-capture.tsx`
- Create: `components/analytics/purchase-tracker.tsx`
- Modify: `components/analytics/analytics-scripts.tsx`

- [x] Add UTM capture/read/append helpers (`utm_*`, `gclid`, `fbclid`) via sessionStorage
- [x] Add `trackPurchase({ transactionId, value, currency, items })`
- [x] Mount `<UtmCapture />` next to analytics scripts
- [x] Mount `<PurchaseTracker />` on thank-you page

### Task 2: Checkout URL + buy buttons

**Files:**
- Modify: `lib/course/checkout-url.ts`
- Modify: `components/course/buy-button.tsx`
- Modify: `components/career-path/career-path-buy-button.tsx`
- Modify: `components/kitaplik/kitaplik-purchase-buttons.tsx`
- Modify: `components/shop/shop-buy-button.tsx`

- [x] Append stored UTMs on every checkout URL
- [x] Pass `thorius_return` = post-purchase destination (panel / kitaplarım), not thank-you
- [x] Fire `trackBeginCheckout` on career-path / kitaplik / shop where missing

### Task 3: WP plugin redirect through thank-you

**Files:**
- Modify: `wordpress/thorius-checkout/thorius-checkout.php` (bump to 1.8.0)
- Modify: `wordpress/thorius-checkout/README.md`

- [x] Build Academy `/tesekkurler` URL with order value + content ids + `next`
- [x] Use that as post-payment redirect target
- [x] Document `THORIUS_GA_ID` / `THORIUS_META_PIXEL_ID` + redeploy note

### Task 4: Thank-you page wires Purchase

**Files:**
- Modify: `app/[locale]/(marketing)/tesekkurler/page.tsx`

- [x] Read `order_id`, `value`, `currency`, `content_ids`, `content_name`, `next`
- [x] Render PurchaseTracker
- [x] CTA uses `next` when safe same-site path/URL

### Task 5: Verify

- [x] Typecheck touched TS files
- [ ] Manual checklist in chat for WP plugin upload + env IDs
