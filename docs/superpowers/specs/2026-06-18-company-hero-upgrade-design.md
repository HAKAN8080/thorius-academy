# thorius.com.tr Kurumsal Hero — Yükseltme (Tasarım)

**Tarih:** 2026-06-18
**Kapsam:** `thorius.com.tr` kurumsal ana sayfasının hero bölümünü mevcut sade halinden CLAUDE.md vizyonuna taşımak.
**Branch:** `feature/company-hero-upgrade`

## 1. Problem & Hedef

`thorius.com.tr` kurumsal ana sayfası bu repodaki tek Next.js app'inden host bazlı (`lib/site/site-mode.ts` → `company` modu) servis ediliyor. Kurumsal hero şu an `components/marketing/company-home-page.tsx` içinde inline: `bg-primary-950` üstünde radial gradient, ortalanmış metin + 2 CTA, `py-20` yükseklik. Particle canvas, animasyon veya tam ekran kompozisyon yok.

CLAUDE.md hero vizyonu: **tam ekran, lacivert bg, altın vurgular, vanilla JS particle canvas, fade-up scroll animasyonu.** Bu spec mevcut hero'yu o vizyona taşır ve altına bir ekosistem şeridi ekler. Mevcut metin ve CTA içeriği korunur.

## 2. Kapsam Dışı (YAGNI)

- Diğer section'lar (model, danışmanlık alanları, kurucular, ekosistem CTA) **değişmez**.
- Academy (`hero.tsx`) hero'su **değişmez** — bu yalnızca `company` modu hero'su.
- Yeni içerik/metin yazımı yok; mevcut `lib/content/company-model.ts` sabitleri kullanılır.

## 3. Mimari

Mevcut hero `CompanyHomePage` (server component) içinde inline. Particle canvas client-side gerektirdiği için hero kendi dosyasına çıkarılır.

### Yeni dosyalar
- **`components/marketing/particle-canvas.tsx`** (`"use client"`)
  - Bağımsız, yeniden kullanılabilir vanilla `<canvas>` parçacık arka planı. 3rd-party lib YOK (tsparticles/three.js yasak).
  - `requestAnimationFrame` döngüsü; düşük yoğunluklu altın/beyaz parçacıklar, hafif sürüklenme + bağlantı çizgileri (opsiyonel, hafif).
  - **Performans/erişilebilirlik kuralları:**
    - `prefers-reduced-motion: reduce` → hiç render etmez (`return null`).
    - `document.hidden` (tab gizli) veya `IntersectionObserver` ile viewport dışında → RAF döngüsü durur.
    - Parçacık sayısı viewport genişliğine göre ölçeklenir (mobilde belirgin az).
    - `devicePixelRatio` capped (max 2) — yüksek DPI'da aşırı çizimi önler.
    - `resize` ile canvas yeniden boyutlandırılır; cleanup'ta RAF + listener'lar kaldırılır.
  - `aria-hidden="true"`, `pointer-events-none`, dekoratif.

- **`components/marketing/company-hero.tsx`**
  - Hero section'ı. Server-render edilen metin (LCP dostu) + arka planda `<ParticleCanvas />`.
  - `min-h-[100svh]`, dikey ortalı içerik, `bg-primary-950` + mevcut radial gradient korunur.
  - İçerik (mevcut, korunur): `COMPANY_LEGAL_NAME` eyebrow → H1 ("Perakende dönüşümünde **uçtan uca** partneriniz", `uçtan uca` altın) → `COMPANY_TAGLINE` → `COMPANY_HERO_SUBTITLE` → 2 CTA: "Görüşme talep edin" (`variant="gold"`, `/kurumsal#iletisim`) + "Modelimizi keşfedin" (outline, `/#model`).
  - Fade-up: metin öğeleri CSS `@keyframes` ile mount'ta stagger'lı; above-the-fold olduğu için IntersectionObserver gerekmez.
  - **Alt ekosistem şeridi:** 4 sütun — `VALUE_CHAIN_STEPS` başlıkları (Danışmanlık & Audit · AI4U Retail · Thorius Academy · Thorius Coaching). Üstte ince altın ayraç. Etiketler kısa; tam başlık yerine sade form (örn. "Danışmanlık", "AI4U Retail", "Academy", "Coaching"). Statik metin (link zorunlu değil); görsel güven öğesi.

### Değişen dosyalar
- **`components/marketing/company-home-page.tsx`** — inline hero `<section>` bloğu `<CompanyHero />` ile değişir. Geri kalan import/section'lar aynı.
- **`app/globals.css`** — hero fade-up için `@keyframes` + util sınıf(lar)ı eklenir; mevcut `prefers-reduced-motion` bloğuna dahil edilir.

### Konum notu
CLAUDE.md `/components/sections/` der; repo fiilen `components/marketing/` kullanır (company-home-page, hero, ecosystem hepsi orada). Tutarlılık için `components/marketing/` seçildi.

## 4. Veri Akışı

`CompanyHomePage` (server) → `<CompanyHero />` (server, metin SSR) → içinde `<ParticleCanvas />` (client, yalnızca dekoratif arka plan). İçerik tamamen `lib/content/company-model.ts` sabitlerinden gelir; prop yok.

## 5. Hata / Kenar Durumları

- Canvas API yoksa veya `getContext("2d")` null → sessizce render etmez, hero metni etkilenmez.
- Reduced-motion: particle yok, fade-up yok (anında görünür).
- SSR: canvas yalnızca client'ta mount olur; server'da boş/placeholder. Layout shift olmaması için canvas absolute + `inset-0` (CLS=0 hedefi).
- Çok dar viewport (375px): içerik tek sütun, ekosistem şeridi 2x2 grid'e sarar.

## 6. Performans (CLAUDE.md hedefleri)

- LCP: hero başlığı server-rendered → hızlı. Canvas dekoratif, LCP öğesi değil.
- JS bundle: particle canvas saf vanilla, küçük; lib eklenmez (<150KB hedefi korunur).
- CLS: canvas absolute konumlu, layout itmez (<0.1 hedef).
- Lighthouse 90+: reduced-motion + offscreen pause + DPR cap ile main-thread yükü sınırlı.

## 7. Test

- **ParticleCanvas:**
  - `prefers-reduced-motion: reduce` mock'landığında `null` render eder (DOM'da canvas yok).
  - Mount'ta `<canvas aria-hidden="true">` render eder (motion açıkken).
  - Unmount'ta RAF iptal + event listener cleanup (spy ile doğrulanır).
- **CompanyHero:**
  - `COMPANY_LEGAL_NAME`, H1 metni, `COMPANY_TAGLINE`, `COMPANY_HERO_SUBTITLE` render edilir.
  - 2 CTA doğru href ile: `/kurumsal#iletisim` ve `/#model`.
  - 4 ekosistem etiketi render edilir.
- **CompanyHomePage:** `<CompanyHero />` render eder; eski inline hero başlığı tek sefer görünür (regresyon yok).

## 8. Belirsizlikler (çözüldü)

- Dosya konumu: `components/marketing/` (repo konvansiyonu) — onaylandı.
- KPI şeridi içeriği: Ekosistem (4 hizmet kolu) — onaylandı.
- Kompozisyon: tam ekran + alt ekosistem şeridi — onaylandı.
