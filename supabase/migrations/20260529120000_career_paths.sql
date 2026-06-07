-- Kariyer yolları: yönetici tanımlı roadmap + öğrenci ilerlemesi

CREATE TABLE IF NOT EXISTS public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  hero_eyebrow TEXT NOT NULL DEFAULT 'Uzmanlık Akademisi',
  outcomes JSONB NOT NULL DEFAULT '[]'::jsonb,
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  catalog_href TEXT NOT NULL DEFAULT '/kurslar',
  catalog_label TEXT NOT NULL DEFAULT 'İlgili kurslar',
  closing_title TEXT NOT NULL DEFAULT '',
  closing_description TEXT NOT NULL DEFAULT '',
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.career_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID NOT NULL REFERENCES public.career_paths (id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  level TEXT NOT NULL DEFAULT 'Adım',
  label TEXT NOT NULL,
  course_slug TEXT NOT NULL,
  fallback_title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (career_path_id, step_order),
  UNIQUE (career_path_id, course_slug)
);

CREATE INDEX IF NOT EXISTS career_path_steps_path_order_idx
  ON public.career_path_steps (career_path_id, step_order);

CREATE TABLE IF NOT EXISTS public.career_path_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  career_path_id UUID NOT NULL REFERENCES public.career_paths (id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, career_path_id)
);

CREATE INDEX IF NOT EXISTS career_path_enrollments_user_idx
  ON public.career_path_enrollments (user_id);

ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "career_paths_public_read"
  ON public.career_paths
  FOR SELECT
  TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "career_path_steps_public_read"
  ON public.career_path_steps
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.career_paths cp
      WHERE cp.id = career_path_id
        AND cp.is_published = true
    )
  );

CREATE POLICY "career_path_enrollments_select_own"
  ON public.career_path_enrollments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "career_path_enrollments_insert_own"
  ON public.career_path_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- İlk seed: mevcut 3 kariyer yolu (yayında)
INSERT INTO public.career_paths (
  slug, title, subtitle, hero_eyebrow, outcomes, catalog_href, catalog_label,
  closing_title, closing_description, is_published, sort_order
) VALUES
(
  'retail-planning',
  'Retail Planning Kariyer Yolu',
  'Perakende planlamada başlangıçtan uzmanlığa — gerçek kurslarla adım adım ilerleyin.',
  'Uzmanlık Akademisi',
  '["Open To Buy hazırlayabilir","Stock ve range plan tasarlayabilir","Envanter kararlarını veriye dayalı alabilir","AI destekli forecast kullanabilir","Merchandise Planner rolüne hazırlanabilir"]'::jsonb,
  '/kurslar?kategori=planlama',
  'Planlama kursları',
  'Perakende planlamada uzmanlaşmaya hazır mısınız?',
  'Tüm planlama kataloğunu keşfedin veya kurumsal paketler için ekibimizle görüşün.',
  true,
  1
),
(
  'insan-kaynaklari',
  'İnsan Kaynakları Kariyer Yolu',
  'İK fonksiyonundan dijital ve analitik İK uzmanlığına.',
  'İK Uzmanlık Akademisi',
  '["İK stratejisini iş hedefleriyle hizalayabilir","İşe alım süreçleri kurabilir","İK analitiği ile karar alabilir","Dijital İK süreçlerinde çalışabilir"]'::jsonb,
  '/kurslar?kategori=insan-kaynaklari',
  'İK kursları',
  'İK kariyerinizi bir üst seviyeye taşıyın',
  'İnsan kaynakları kurslarını keşfedin veya kurumsal İK akademisi için teklif alın.',
  true,
  2
),
(
  'yapay-zeka',
  'Yapay Zeka Kariyer Yolu',
  'AI okuryazarlığından LLM geliştirmeye.',
  'AI Uzmanlık Akademisi',
  '["Etkili prompt kullanabilir","Üretken AI araçlarıyla verim artırabilir","LLM mantığını anlayabilir","AI destekli ürün rollerine hazırlanabilir"]'::jsonb,
  '/kurslar?kategori=ai',
  'Yapay zeka kursları',
  'Yapay zeka uzmanlığınızı inşa edin',
  'AI kurs kataloğunu keşfedin veya kurumsal dijital dönüşüm paketleri için iletişime geçin.',
  true,
  3
)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.career_path_steps (
  career_path_id, step_order, level, label, course_slug, fallback_title, description
)
SELECT cp.id, s.step_order, s.level, s.label, s.course_slug, s.fallback_title, s.description
FROM public.career_paths cp
JOIN (
  VALUES
    ('retail-planning', 1, 'Başlangıç', 'Perakende Planlamaya Giriş', 'perakande-muhendisligine-giris-planlama', 'Perakende Mühendisliğine Giriş: Planlama', 'Planlama fonksiyonunun perakende mühendisliğindeki rolü.'),
    ('retail-planning', 2, 'Temel', 'Planlama & Verinin Gücü', 'planlama', 'Planlama ve İstatistik: Verinin Gücü', 'Veri okuryazarlığı ve planlama temelleri.'),
    ('retail-planning', 3, 'Orta', 'Option, Range & Stock Plan', 'musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan', 'Stock Option Plan ve Range Plan', 'OTB ve range planlamanın pratik adımları.'),
    ('retail-planning', 4, 'İleri', 'Envanter & Tedarik Zinciri', 'tedarik-zinciri-yonetimi', 'Tedarik Zinciri Yönetimi', 'Envanter ve replenishment kararları.'),
    ('retail-planning', 5, 'Uzman', 'AI Destekli Planlama', 'google-turkiye-uretkenliginizi-yapay-zeka-ile-artirin', 'Üretkenliğinizi Yapay Zeka ile Artırın', 'Forecast ve raporlamada AI araçları.')
) AS s(path_slug, step_order, level, label, course_slug, fallback_title, description)
  ON cp.slug = s.path_slug
ON CONFLICT DO NOTHING;

INSERT INTO public.career_path_steps (
  career_path_id, step_order, level, label, course_slug, fallback_title, description
)
SELECT cp.id, s.step_order, s.level, s.label, s.course_slug, s.fallback_title, s.description
FROM public.career_paths cp
JOIN (
  VALUES
    ('insan-kaynaklari', 1, 'Başlangıç', 'İK Fonksiyonu & İşe Alım', 'insan-kaynaklari-part-1-insan-kaynaklarinin-rolu-ise-alim-ve-performans-yonetimi', 'İK Part 1', 'İşe alım ve performans yönetimi.'),
    ('insan-kaynaklari', 2, 'Temel', 'Eğitim, Ücret & Çalışan Deneyimi', 'insan-kaynaklari-part-2-egitim-ucret-calisan-deneyimi-baglilik-isveren-markasi-dijital-ik', 'İK Part 2', 'Ücret, deneyim ve dijital İK.'),
    ('insan-kaynaklari', 3, 'Orta', 'İK Analitiği', 'insan-kaynaklari-analitigi', 'İnsan Kaynakları Analitiği', 'Veriye dayalı İK kararları.'),
    ('insan-kaynaklari', 4, 'İleri', 'Dijital İK & Otomasyon', 'google-turkiye-yapay-zeka-ile-gorevleri-otomatiklestirin', 'AI ile Otomasyon', 'Tekrarlayan İK süreçlerinde AI.'),
    ('insan-kaynaklari', 5, 'Uzman', 'İK''da Üretken AI', 'google-turkiye-uretkenlik-icin-yapay-zeka-destekli-araclar', 'Üretken AI Araçları', 'Politika ve raporlamada üretken AI.')
) AS s(path_slug, step_order, level, label, course_slug, fallback_title, description)
  ON cp.slug = s.path_slug
ON CONFLICT DO NOTHING;

INSERT INTO public.career_path_steps (
  career_path_id, step_order, level, label, course_slug, fallback_title, description
)
SELECT cp.id, s.step_order, s.level, s.label, s.course_slug, s.fallback_title, s.description
FROM public.career_paths cp
JOIN (
  VALUES
    ('yapay-zeka', 1, 'Başlangıç', 'Yapay Zekaya Genel Bakış', 'google-turkiye-yapay-zekaya-genel-bakis', 'Yapay Zekaya Genel Bakış', 'AI kavramları ve iş etkisi.'),
    ('yapay-zeka', 2, 'Temel', 'Prompt & Etkili Kullanım', 'google-turkiye-yapay-zekayi-etkili-istemler-ile-kullanin', 'Etkili İstemler', 'Prompt teknikleri.'),
    ('yapay-zeka', 3, 'Orta', 'Üretkenlik & İçerik', 'google-turkiye-yapay-zeka-ile-icerik-uretin', 'İçerik Üretimi', 'İş içeriklerinde üretken AI.'),
    ('yapay-zeka', 4, 'İleri', 'LLM & Üretken AI', 'tubitak-bilgem-uretken-yapay-zeka-ve-buyuk-dil-modelleri-bilgem-techtalks-teknoloji-konusmalari', 'Büyük Dil Modelleri', 'LLM mimarisi ve kullanımı.'),
    ('yapay-zeka', 5, 'Uzman', 'Sıfırdan LLM Geliştirme', 'new-course-8', 'Sıfırdan LLM Geliştirme', 'LLM uygulama geliştirme temelleri.')
) AS s(path_slug, step_order, level, label, course_slug, fallback_title, description)
  ON cp.slug = s.path_slug
ON CONFLICT DO NOTHING;
