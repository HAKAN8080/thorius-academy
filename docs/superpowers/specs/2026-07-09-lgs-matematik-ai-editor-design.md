# LGS Matematik AI Soru Editörü — Tasarım Spesifikasyonu

**Tarih:** 2026-07-09  
**Durum:** Taslak — kullanıcı onayı bekleniyor  
**Yaklaşım:** C (Aşamalı)

## Özet

Thorius Yayınevi ekibinin kullanacağı, TYMM uyumlu bağlam temelli çoktan seçmeli soru üretim ve onay paneli. AI destekli üretim; insan onayı zorunlu. İlk hedef: 8. sınıf Matematik Tema 1 (Sayılar ve Nicelikler), öğrenme çıktısı MAT.8.1.1.

**Referanslar:**
- [MEB Bağlam Temelli Çoktan Seçmeli Soru Yazım Kılavuzu](https://tymm.meb.gov.tr) (Mart 2026, kullanıcı PDF)
- [TYMM 8. Sınıf Matematik — Tema 1](https://tymm.meb.gov.tr/ortaokul-matematik-dersi/unite/472)

---

## Hedefler

1. Editör, TYMM öğrenme çıktısı + süreç bileşeni seçerek AI ile bağlam + soru seti üretebilsin.
2. Üretilen içerik MEB kılavuzundaki Soru Yazım Formu ve kontrol listesiyle yapılandırılsın.
3. Hiçbir soru editör onayı olmadan “yayına hazır” statüsüne geçemesin.
4. Faz 1 sonunda MAT.8.1.1 için uçtan uca çalışan bir akış olsun (üret → incele → onayla).

## Kapsam Dışı (Faz 1)

- Öğrenci tarafı / online test uygulaması
- Baskıya hazır PDF kitap montajı (Faz 3)
- Tema 1’in MAT.8.1.2–8.1.4 kazanımları (Faz 2)
- AI ile serbest çizim / fotoğraf üretimi
- WooCommerce / Kitaplık satış entegrasyonu

---

## Faz Planı

### Faz 1 — MAT.8.1.1 uçtan uca (MVP)

- TYMM Tema 1 veri seed (en az MAT.8.1.1 + 5 süreç bileşeni)
- `/yayinevi` editör paneli (auth: mevcut instructor yetkisi veya ayrı `publisher` rolü)
- Bağlam + 2 soruluk set üretimi (AI)
- Tablo görseli (SVG şablon, AI veri doldurur)
- MEB kontrol listesi (otomatik uyarı + editör işaretleme)
- Durum: `draft` → `in_review` → `approved` | `rejected`
- Liste ve detay görünümü

### Faz 2 — Tema 1 tamamı + görsel kütüphane

- MAT.8.1.2, 8.1.3, 8.1.4
- Görsel şablonları: sayı doğrusu, kare alan şekli, karşılaştırma tablosu
- Konu testi montajı (birden fazla bağlam setini bir “test” altında toplama)
- Çeldirici kalite skoru (AI self-check)

### Faz 3 — Kitap çıktısı ve entegrasyon

- PDF export (soru + cevap anahtarı ayrı bölüm)
- Kitaplık / basılı yayın pipeline
- Tema 2–7 genişlemesi

---

## Kullanıcı Akışı (Faz 1)

```
Yayinevi Editörü giriş yapar
  → Yeni bağlam seti oluştur
  → MAT.8.1.1 seçer
  → Süreç bileşeni seçer (ör. c)
  → İsteğe bağlı: bağlam teması (bakteriler, hafıza kartı, deprem…)
  → "AI ile üret" tıklar
  → Sistem üretir:
      - Bağlam metni
      - Tablo görseli (varsa)
      - 2 çoktan seçmeli soru (4 şık, çözüm, çeldirici gerekçesi)
      - MEB kontrol listesi sonuçları
  → Editör düzenler / reddeder / onaylar
  → Onaylı set "konu testi havuzuna" eklenir
```

---

## Veri Modeli

### `curriculum_themes`

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | |
| grade | int | 8 |
| subject | text | `matematik` |
| theme_number | int | 1 |
| title | text | Sayılar ve Nicelikler |
| tymm_unit_url | text | unite/472 |
| area_skills | jsonb | MAB kodları |
| conceptual_skills | jsonb | KB kodları |

### `learning_outcomes`

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | |
| theme_id | uuid FK | |
| code | text | `MAT.8.1.1` |
| title | text | Tam öğrenme çıktısı metni |
| content_framework | text[] | Üslü ifadeler, … |
| context_hints | text[] | TYMM öğretim yaşantılarından bağlam ipuçları |
| key_concepts | text[] | |

### `process_components`

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | |
| outcome_id | uuid FK | |
| letter | text | `a`, `b`, `c`, `ç`, `d` |
| description | text | Süreç bileşeni metni |

### `context_sets` (ana üretim birimi)

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | |
| outcome_id | uuid FK | |
| process_component_id | uuid FK | |
| title | text | Bağlam adı (MEB formu) |
| context_body | text | Senaryo metni |
| visual_type | enum | `none`, `table`, `number_line` |
| visual_data | jsonb | Şablon için yapılandırılmış veri |
| visual_svg | text | Render edilmiş SVG |
| difficulty | enum | `kolay`, `orta`, `zor` |
| source_note | text | Yararlanılan kaynak |
| status | enum | `draft`, `in_review`, `approved`, `rejected` |
| author_id | uuid | |
| reviewer_notes | text | |
| meb_checklist | jsonb | 18 madde evet/hayır + not |
| created_at, updated_at | timestamptz | |

### `context_questions`

| Alan | Tip | Açıklama |
|------|-----|----------|
| id | uuid | |
| context_set_id | uuid FK | |
| sort_order | int | 1, 2 |
| stem | text | Soru kökü |
| options | jsonb | `[{key:"A",text:"..."}, ...]` |
| correct_option | text | `A`–`D` |
| solution | text | Çözüm açıklaması |
| distractor_rationale | jsonb | Her yanlış şık için yanılgı açıklaması |
| process_component_letter | text | Hangi SB ölçülüyor |

---

## AI Pipeline

### Girdi (system + user prompt)

- MEB kılavuz özeti (bağlam işlevselliği, çeldirici kuralları, yasaklar)
- Seçilen `learning_outcome` + `process_component` tam metni
- `context_hints` (TYMM’den)
- İsteğe bağlı tema tercihi (bakteriler vb.)
- Zorluk seviyesi

### Çıktı (yapılandırılmış JSON)

```json
{
  "context_title": "...",
  "context_body": "...",
  "visual": {
    "type": "table",
    "headers": ["Saat", "Bakteri"],
    "rows": [[0, 1], [1, 3]]
  },
  "questions": [
    {
      "stem": "...",
      "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
      "correct": "B",
      "solution": "...",
      "distractors": {"A": "üs karışıklığı", "C": "..."}
    }
  ],
  "self_check": {
    "context_functional": true,
    "no_hepsi_hicbiri": true,
    "option_length_balanced": true
  }
}
```

### Doğrulama katmanı

1. JSON şema validasyonu
2. Kurallar motoru: “Hepsi/Hiçbiri” yasak, 4 şık zorunlu, doğru cevap tek
3. Matematik doğruluk (Faz 1: AI + editör; Faz 2: sembolik hesap kontrolü mümkünse)
4. MEB checklist otomatik doldurma + editör onayı

### API

- `POST /api/yayinevi/generate` — server-side, API key güvenli
- Rate limit + audit log

---

## Görsel Şablonları (Faz 1)

| Tip | Kullanım | MAT.8.1.1 |
|-----|----------|-----------|
| `table` | Zaman-serisi, karşılaştırma | Bakteri çoğalması tablosu |
| `number_line` | — | Faz 2 (8.1.4) |

Tablo: React/SVG şablon; `visual_data` → `visual_svg` server veya client render.

MEB kuralı: görsel metni tekrar etmemeli; çözüm için okunması zorunlu olmalı.

---

## UI (Faz 1)

**Rota:** `/yayinevi` (app route group `(app)/yayinevi`)

| Sayfa | İşlev |
|-------|--------|
| `/yayinevi` | Onaylı / taslak set listesi |
| `/yayinevi/yeni` | Kazanım seçimi + üretim sihirbazı |
| `/yayinevi/[id]` | Düzenleme, checklist, onay/red |
| `/yayinevi/kazanımlar` | TYMM ağacı (Tema 1, Faz 1’de sadece 8.1.1 aktif üretim) |

Mevcut `instructor-shell` veya yeni `yayinevi-shell` — instructor auth pattern reuse.

---

## Yetkilendirme

- Faz 1: `canManage` instructor erişimi (mevcut `getCurriculumAccess`) yeterli
- Faz 2+: ayrı `publisher` rolü veya allowlist tablosu

---

## Teknoloji

- **Mevcut stack:** Next.js 14, Supabase, TypeScript, Tailwind
- **AI:** OpenAI veya Anthropic API (env `YAYINEVI_AI_*`)
- **Görsel:** SVG şablonlar (`lib/yayinevi/visual-templates/`)
- **Veri seed:** `lib/yayinevi/curriculum/grade-8-matematik-tema-1.json`

---

## Başarı Kriterleri (Faz 1)

- [ ] Editör MAT.8.1.1 / süreç (c) seçip AI ile bağlam + 2 soru üretebilir
- [ ] Üretim tablo görseli içerir (uygun bağlamda)
- [ ] MEB checklist ekranda görünür; editör onaylamadan `approved` olmaz
- [ ] Onaylı set listede görünür ve tekrar düzenlenebilir
- [ ] Üretim prompt’u MEB yasaklarını ihlal eden çıktıyı self_check ile işaretler

---

## Riskler ve Azaltma

| Risk | Azaltma |
|------|---------|
| AI matematik hatası | Zorunlu editör onayı; çözüm alanı görünür |
| TYMM veri güncellemesi | `tymm_unit_url` + seed versiyonlama |
| Görsel kalitesi düşük | Faz 1’de sınırlı şablon; editör metin/tabloyu düzenleyebilir |
| Telif / kopya | Prompt: özgün bağlam; mevcut yayınlardan uzak dur |

---

## Sonraki Adım

Kullanıcı bu spec’i onayladıktan sonra: `docs/superpowers/plans/2026-07-09-lgs-matematik-ai-editor-faz1.md` uygulama planı yazılacak ve Faz 1 kodlamasına başlanacak.
