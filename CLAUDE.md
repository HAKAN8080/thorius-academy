# Thorius Homepage — CLAUDE.md

## Proje
thorius.com.tr kurumsal ana sayfa redesign.
Stack: Next.js 14 App Router · Tailwind CSS · TypeScript · Vercel

## Kimlik & Marka
- Şirket: Thorius Eğitim ve Danışmanlık Ltd. Şti.
- Segment: Retail consulting + AI-powered SaaS + Thorius Academy (e-learning)
- Hedef kitle: C-level retail yöneticileri, kurumsal karar alıcılar
- Ton: Premium, güvenilir, enterprise-grade — ajans değil danışmanlık firması

## Renk Paleti (kesinlikle değiştirme)
- Lacivert (primary):  #0B1E3F
- Altın (accent):      #D4AF37
- Beyaz (background):  #FFFFFF
- Açık gri (surface):  #F5F5F5
- Koyu metin:          #1A1A2E

## Tipografi
- Display: Inter veya Playfair Display (başlıklar, hero)
- Body: Inter (okunabilirlik öncelikli)
- Accent labels: Inter Mono (KPI/istatistik gösterimi için)

## Layout Kuralları
- Canvas background: vanilla JS particle (NO tsparticles, NO three.js)
- Animasyon: fade-up scroll-triggered, her section için
- Mobile-first, responsive down to 375px
- Hero: tam ekran, lacivert bg, altın vurgular, particle canvas
- Sections: Hero → Hizmetler → Academy → AI Araçları → Referanslar → İletişim

## Kod Standartları
- Tüm component'lar: TypeScript + functional
- Tailwind utility-first — custom CSS sadece particle canvas için
- Image: next/image, WebP format
- Font: next/font/google
- Her component kendi dosyasında (/components/sections/)

## NDA Kısıtlamaları — KESİNLİKLE UYMA
Aşağıdakileri ASLA referans, logo, vaka çalışması veya müşteri olarak kullanma:
- Aydınlı Group / Pierre Cardin / Cacharel / U.S. Polo Assn.
- English Home (EHM)
- EVE Kozmetik
- Getron Bilişim
Bunların yerine: Inditex/Zara, Uniqlo, H&M, Nike, Walmart gibi global public vakalar kullan.

## Workflow (Superpowers ile)
1. Her yeni feature → önce brainstorm skill
2. Her component → TDD (test önce, sonra kod)
3. Her PR → code-review agent çalıştır
4. Her UI değişikliği → frontend-design skill'e bak
5. Bitişten önce → verification-before-completion

## Performans Hedefleri
- Lighthouse Performance: 90+
- LCP: 2.5s altı
- CLS: 0.1 altı
- Bundle size: 150KB JS altı (gzip)

## GitHub
Repo: HAKAN8080/thorius-academy (veya ayrı repo açılacaksa belirt)
Branch stratejisi: main (prod) · dev (aktif) · feature/xxx

## Notlar
- "Thorius Academy" footer ve cover'larda kullanılır
- Legal belgeler için: "Thorius Eğitim ve Danışmanlık Ltd. Şti."
- Mac username: eladenizugur · M4 iMac · Miniconda base env
