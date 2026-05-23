# Thorius Academy

**Perakendenin Yeni Nesil Akademisi** — Türkiye perakende sektörü için premium B2B eğitim platformu.

## Teknoloji Yığını

- Next.js 14 (App Router, TypeScript)
- Tailwind CSS + shadcn/ui
- Supabase Auth (`@supabase/supabase-js`, `@supabase/ssr`)
- Inter font

## Gereksinimler

- Node.js 18+
- npm
- Supabase projesi

## Kurulum

```bash
# Bağımlılıklar (repo klonlandıktan sonra)
npm install

# Ortam değişkenleri
cp .env.example .env.local
```

`.env.local` dosyasını doldurun:

| Değişken | Açıklama |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase proje URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon / publishable key |
| `SUPABASE_SECRET_KEY` | Sunucu tarafı service role (ileride) |
| `NEXT_PUBLIC_APP_URL` | Uygulama URL (ör. `http://localhost:3000`) |

## Geliştirme

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

## Üretim Derlemesi

```bash
npm run build
npm run start
```

## Proje Yapısı

```
app/
├── (marketing)/     # Anasayfa, kurslar, kurumsal
├── (auth)/          # Giriş, kayıt
├── (app)/           # Üye paneli
components/
├── ui/              # shadcn bileşenleri
├── layout/          # Header, footer
└── marketing/       # Hero, kategori, kurs kartı
lib/
├── supabase/        # Client, server, middleware
└── data/            # Mock kurs verisi
```

## Sonraki Adımlar

- Supabase şema ve gerçek kurs verisi
- WordPress / Tutor LMS entegrasyonu
- Bunny.net video streaming
- PayTR ödeme entegrasyonu

## Lisans

Özel — Thorius Eğitim ve Danışmanlık Ltd. Şti.
