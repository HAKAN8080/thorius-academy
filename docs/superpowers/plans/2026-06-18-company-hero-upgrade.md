# thorius.com.tr Kurumsal Hero Yükseltme — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `thorius.com.tr` kurumsal hero'sunu tam ekran, vanilla JS particle canvas, fade-up animasyon ve alt ekosistem şeridi ile premium enterprise görünüme yükseltmek.

**Architecture:** Mevcut inline hero, `CompanyHomePage` (server component) içinden `<CompanyHero />`'ya çıkarılır. Particle arka planı bağımsız `"use client"` `ParticleCanvas` component'idir. Hero metni server-rendered kalır (LCP dostu). Test altyapısı sıfırdan Vitest + Testing Library ile kurulur.

**Tech Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind · Vitest + @testing-library/react + jsdom

## Global Constraints

- Renk paleti sabit: Lacivert `#0B1E3F` (`primary-900`), `primary-950` `#060f24`, Altın `#D4AF37` (`accent-500`), beyaz `#FFFFFF`. Tailwind token'ları kullan (`primary-*`, `accent-*`).
- Particle: yalnızca vanilla JS canvas — tsparticles / three.js / herhangi bir 3rd-party particle lib YASAK.
- Tüm component'lar TypeScript + functional. Yeni component'lar `components/marketing/` altında, her biri kendi dosyasında.
- `prefers-reduced-motion: reduce` → particle render edilmez, fade-up animasyonu kapanır.
- Mevcut hero metni/CTA'ları aynen korunur; içerik `lib/content/company-model.ts` sabitlerinden gelir.
- Path alias: `@/*` → repo kökü.
- Performans: yeni runtime bağımlılığı eklenmez (yalnızca devDependency olarak test araçları), CLS=0 için canvas absolute konumlu.

---

### Task 1: Vitest + Testing Library altyapısı

**Files:**
- Modify: `package.json` (devDependencies + scripts)
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Test: `components/marketing/sanity.test.tsx`

**Interfaces:**
- Consumes: yok
- Produces: `npm test` komutu (vitest run); jsdom ortamı; `@/` alias; global `matchMedia` ve `HTMLCanvasElement.getContext` stub'ları (sonraki task'lar canvas/matchMedia testlerinde buna güvenir).

- [ ] **Step 1: Test araçlarını kur (devDependency)**

```bash
npm install -D vitest@^2 @vitejs/plugin-react@^4 jsdom@^25 @testing-library/react@^16 @testing-library/dom@^10 @testing-library/jest-dom@^6
```

- [ ] **Step 2: Vitest config oluştur**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next"],
  },
  resolve: {
    alias: { "@": resolve(__dirname, ".") },
  },
});
```

- [ ] **Step 3: Setup dosyası oluştur (jsdom polyfill'ler)**

Create `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom matchMedia sağlamaz; varsayılan: reduced-motion KAPALI
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

// jsdom 2d context sağlamaz; RAF döngüsünün hatasız çalışması için stub
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
})) as unknown as typeof HTMLCanvasElement.prototype.getContext;
```

- [ ] **Step 4: package.json'a test script'leri ekle**

`scripts` bloğuna ekle:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Sanity test yaz (failing değil — altyapı doğrulaması)**

Create `components/marketing/sanity.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("test altyapısı", () => {
  it("DOM render edip sorgulayabilir", () => {
    render(<div>thorius</div>);
    expect(screen.getByText("thorius")).toBeInTheDocument();
  });
});
```

- [ ] **Step 6: Testi çalıştır ve geçtiğini doğrula**

Run: `npm test`
Expected: PASS (1 passed) — altyapı çalışıyor.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts components/marketing/sanity.test.tsx
git commit -m "Add Vitest + Testing Library test infrastructure."
```

---

### Task 2: ParticleCanvas component

**Files:**
- Create: `components/marketing/particle-canvas.tsx`
- Test: `components/marketing/particle-canvas.test.tsx`

**Interfaces:**
- Consumes: Task 1'in matchMedia + getContext stub'ları.
- Produces: `export function ParticleCanvas(props: { className?: string }): JSX.Element | null` — `"use client"`. Reduced-motion'da `null`; aksi halde `<canvas aria-hidden="true">`. CompanyHero (Task 3) bunu arka plan olarak tüketir.

- [ ] **Step 1: Failing testleri yaz**

Create `components/marketing/particle-canvas.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { ParticleCanvas } from "@/components/marketing/particle-canvas";

function setReducedMotion(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => {
  setReducedMotion(false);
  vi.restoreAllMocks();
});

describe("ParticleCanvas", () => {
  it("motion açıkken aria-hidden canvas render eder", () => {
    setReducedMotion(false);
    const { container } = render(<ParticleCanvas className="absolute" />);
    const canvas = container.querySelector("canvas");
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveAttribute("aria-hidden", "true");
    expect(canvas).toHaveClass("absolute");
  });

  it("prefers-reduced-motion: reduce iken hiçbir şey render etmez", () => {
    setReducedMotion(true);
    const { container } = render(<ParticleCanvas />);
    expect(container.querySelector("canvas")).toBeNull();
  });

  it("unmount'ta requestAnimationFrame iptal edilir", () => {
    setReducedMotion(false);
    const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<ParticleCanvas />);
    unmount();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Testi çalıştır, fail ettiğini doğrula**

Run: `npm test -- particle-canvas`
Expected: FAIL — "Failed to resolve import ... particle-canvas" / module yok.

- [ ] **Step 3: Component'i implemente et**

Create `components/marketing/particle-canvas.tsx`:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ParticleCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(!prefersReducedMotion());
  }, []);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let raf = 0;
    let running = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(80, Math.max(18, Math.round((w * h) / 18000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      }));
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212, 175, 55, 0.5)";
        ctx.fill();
      }
      if (running) {
        raf = requestAnimationFrame(draw);
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(draw);
      }
    };

    resize();
    raf = requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npm test -- particle-canvas`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add components/marketing/particle-canvas.tsx components/marketing/particle-canvas.test.tsx
git commit -m "Add vanilla JS ParticleCanvas with reduced-motion + offscreen pause."
```

---

### Task 3: CompanyHero component

**Files:**
- Create: `components/marketing/company-hero.tsx`
- Test: `components/marketing/company-hero.test.tsx`

**Interfaces:**
- Consumes: `ParticleCanvas` (Task 2); `Container` (`@/components/layout/container`, prop `size`); `Button` (`@/components/ui/button`, `variant="gold" | "outline"`, `asChild`); sabitler `COMPANY_LEGAL_NAME`, `COMPANY_TAGLINE`, `COMPANY_HERO_SUBTITLE` (`@/lib/content/company-model`).
- Produces: `export function CompanyHero(): JSX.Element` — CompanyHomePage (Task 4) bunu tüketir. Markup'ta `id="company-hero-heading"` H1, 2 CTA (`/kurumsal#iletisim`, `/#model`), 4 ekosistem etiketi (Danışmanlık · AI4U Retail · Academy · Coaching).

- [ ] **Step 1: Failing testleri yaz**

Create `components/marketing/company-hero.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompanyHero } from "@/components/marketing/company-hero";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_TAGLINE,
  COMPANY_HERO_SUBTITLE,
} from "@/lib/content/company-model";

describe("CompanyHero", () => {
  it("şirket adı, başlık ve tagline'ları render eder", () => {
    render(<CompanyHero />);
    expect(screen.getByText(COMPANY_LEGAL_NAME)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /uçtan uca partneriniz/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(COMPANY_TAGLINE)).toBeInTheDocument();
    expect(screen.getByText(COMPANY_HERO_SUBTITLE)).toBeInTheDocument();
  });

  it("iki CTA'yı doğru href ile render eder", () => {
    render(<CompanyHero />);
    expect(
      screen.getByRole("link", { name: "Görüşme talep edin" }),
    ).toHaveAttribute("href", "/kurumsal#iletisim");
    expect(
      screen.getByRole("link", { name: "Modelimizi keşfedin" }),
    ).toHaveAttribute("href", "/#model");
  });

  it("dört ekosistem etiketini render eder", () => {
    render(<CompanyHero />);
    for (const label of ["Danışmanlık", "AI4U Retail", "Academy", "Coaching"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Testi çalıştır, fail ettiğini doğrula**

Run: `npm test -- company-hero`
Expected: FAIL — module yok.

- [ ] **Step 3: Component'i implemente et**

Create `components/marketing/company-hero.tsx`:

```tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { ParticleCanvas } from "@/components/marketing/particle-canvas";
import {
  COMPANY_HERO_SUBTITLE,
  COMPANY_LEGAL_NAME,
  COMPANY_TAGLINE,
} from "@/lib/content/company-model";

const ECOSYSTEM = [
  "Danışmanlık",
  "AI4U Retail",
  "Academy",
  "Coaching",
] as const;

export function CompanyHero() {
  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-primary-950 py-24 text-white"
      aria-labelledby="company-hero-heading"
    >
      <ParticleCanvas className="absolute inset-0 h-full w-full" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent-600/15 via-transparent to-transparent"
        aria-hidden="true"
      />

      <Container size="wide" className="relative w-full">
        <div className="mx-auto max-w-4xl text-center">
          <p className="hero-fade-up text-sm font-semibold uppercase tracking-[0.22em] text-accent-400">
            {COMPANY_LEGAL_NAME}
          </p>
          <h1
            id="company-hero-heading"
            className="hero-fade-up hero-fade-up-1 mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl"
          >
            Perakende dönüşümünde{" "}
            <span className="text-accent-400">uçtan uca</span> partneriniz
          </h1>
          <p className="hero-fade-up hero-fade-up-2 mx-auto mt-5 max-w-2xl text-lg font-medium text-primary-200">
            {COMPANY_TAGLINE}
          </p>
          <p className="hero-fade-up hero-fade-up-3 mx-auto mt-4 max-w-3xl leading-relaxed text-primary-300/90">
            {COMPANY_HERO_SUBTITLE}
          </p>
          <div className="hero-fade-up hero-fade-up-4 mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gold" size="lg" asChild>
              <Link href="/kurumsal#iletisim">Görüşme talep edin</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent text-white hover:bg-white hover:text-primary-950"
              asChild
            >
              <Link href="/#model">Modelimizi keşfedin</Link>
            </Button>
          </div>
        </div>

        <ul
          className="hero-fade-up hero-fade-up-5 mx-auto mt-16 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-center sm:grid-cols-4"
          aria-label="Ekosistem"
        >
          {ECOSYSTEM.map((label) => (
            <li
              key={label}
              className="bg-primary-950/70 px-4 py-5 text-sm font-semibold text-primary-100"
            >
              {label}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Testi çalıştır, geçtiğini doğrula**

Run: `npm test -- company-hero`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add components/marketing/company-hero.tsx components/marketing/company-hero.test.tsx
git commit -m "Add full-screen CompanyHero with particle bg and ecosystem strip."
```

---

### Task 4: CompanyHomePage entegrasyonu + fade-up keyframes

**Files:**
- Modify: `components/marketing/company-home-page.tsx` (inline hero `<section>` → `<CompanyHero />`)
- Modify: `app/globals.css` (fade-up keyframes + reduced-motion)
- Test: `components/marketing/company-home-page.test.tsx`

**Interfaces:**
- Consumes: `CompanyHero` (Task 3).
- Produces: yok (terminal entegrasyon).

- [ ] **Step 1: Failing test yaz (entegrasyon regresyonu)**

Create `components/marketing/company-home-page.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CompanyHomePage } from "@/components/marketing/company-home-page";

describe("CompanyHomePage", () => {
  it("yükseltilmiş hero başlığını tek kez render eder", () => {
    render(<CompanyHomePage />);
    const headings = screen.getAllByRole("heading", {
      name: /uçtan uca partneriniz/i,
    });
    expect(headings).toHaveLength(1);
  });

  it("hero CTA'sı ile model bölümünü birlikte render eder", () => {
    render(<CompanyHomePage />);
    expect(
      screen.getByRole("link", { name: "Görüşme talep edin" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /Audit.ten sürdürülebilir yetkinliğe/i }),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Testi çalıştır, fail ettiğini doğrula**

Run: `npm test -- company-home-page`
Expected: İlk test FAIL olabilir (eski inline hero hâlâ orada, ama tek başlık → muhtemelen PASS) — asıl beklenen: import edilen `CompanyHero` henüz kullanılmadığı için davranış eski. İkinci test PASS. Net hedef: Step 3 sonrası ikisi de PASS.

> Not: Eğer ilk testte iki başlık çıkarsa, Step 3'teki değişiklik (inline hero'nun silinmesi) bunu tek başlığa indirir.

- [ ] **Step 3: CompanyHomePage'i düzenle**

`components/marketing/company-home-page.tsx` içinde:

1. Import ekle (dosyanın üst kısmındaki importlara):

```tsx
import { CompanyHero } from "@/components/marketing/company-hero";
```

2. `return (` sonrasındaki ilk `<section ... aria-labelledby="company-hero-heading"> ... </section>` bloğunun TAMAMINI (radial gradient div'i, Container, h1, taglines, 2 CTA dahil) tek satırla değiştir:

```tsx
      <CompanyHero />
```

Geriye kalan tüm section'lar (`id="model"`, danışmanlık alanları, ekosistem, CTA) aynen korunur. Artık kullanılmayan importları (`Container` hâlâ aşağıda kullanılıyor; sadece gerçekten kullanılmayanları) temizle — `Container`, `Button`, `Link` aşağıdaki section'larda kullanılmaya devam ediyor, dokunma.

- [ ] **Step 4: globals.css'e fade-up keyframes ekle**

`app/globals.css` sonuna ekle:

```css
@keyframes heroFadeUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-fade-up {
  animation: heroFadeUp 600ms ease-out both;
}
.hero-fade-up-1 {
  animation-delay: 80ms;
}
.hero-fade-up-2 {
  animation-delay: 160ms;
}
.hero-fade-up-3 {
  animation-delay: 240ms;
}
.hero-fade-up-4 {
  animation-delay: 320ms;
}
.hero-fade-up-5 {
  animation-delay: 400ms;
}

@media (prefers-reduced-motion: reduce) {
  .hero-fade-up {
    animation: none !important;
  }
}
```

- [ ] **Step 5: Testleri çalıştır, hepsinin geçtiğini doğrula**

Run: `npm test`
Expected: PASS (tüm test dosyaları yeşil).

- [ ] **Step 6: Lint + build doğrula**

Run: `npm run lint && npm run build`
Expected: lint temiz, build başarılı (type hata yok).

- [ ] **Step 7: Commit**

```bash
git add components/marketing/company-home-page.tsx app/globals.css components/marketing/company-home-page.test.tsx
git commit -m "Wire CompanyHero into homepage and add fade-up keyframes."
```

---

### Task 5: Manuel görsel doğrulama

**Files:** yok (doğrulama)

- [ ] **Step 1: Dev sunucuyu company modunda başlat**

Run: `NEXT_PUBLIC_SITE_MODE=company npm run dev`

- [ ] **Step 2: `http://localhost:3000/` aç ve kontrol et**

Doğrula:
- Tam ekran lacivert hero, altın parçacıklar hafifçe hareket ediyor.
- Başlık + tagline + 2 CTA + 4 ekosistem etiketi görünür ve fade-up ile geliyor.
- 375px'e kadar responsive (ekosistem 2x2'ye sarıyor).
- macOS "Reduce Motion" açıkken: parçacık yok, içerik anında görünür, layout bozulmuyor.

- [ ] **Step 3: Doğrulama notunu kaydet**

Gözlemleri kullanıcıya raporla. Sorun yoksa branch `superpowers:finishing-a-development-branch` ile tamamlanır.

---

## Self-Review Notları

- **Spec coverage:** particle canvas (Task 2), tam ekran + ekosistem şeridi (Task 3), fade-up + reduced-motion (Task 3/4), entegrasyon (Task 4), performans/manuel (Task 5), test altyapısı (Task 1). Tüm spec bölümleri karşılandı.
- **Type tutarlılığı:** `ParticleCanvas({ className?: string })` Task 2'de tanımlandı, Task 3'te aynı imza ile tüketildi. `CompanyHero()` Task 3 → Task 4.
- **Placeholder:** yok; tüm kod adımları tam.
