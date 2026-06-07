import type { CareerPathDefinition, CareerPathSummary } from "@/lib/content/career-path-types";

const SHARED_MILESTONES = [
  {
    label: "Sertifika",
    description:
      "Her kursu tamamladığınızda dijital katılım belgesi; yolu bitirdiğinizde uzmanlık portföyü.",
  },
  {
    label: "Thorius Coaching",
    description: "CV, mülakat ve kariyer hedefi için bire bir koçluk desteği.",
    href: "/#ecosystem",
  },
  {
    label: "Kurumsal mentorluk",
    description: "Ekip bazlı öğrenme paketleri ve şirket içi uygulama desteği.",
    href: "/kurumsal",
  },
] as const;

export const RETAIL_PLANNING_PATH: CareerPathDefinition = {
  slug: "retail-planning",
  title: "Retail Planning Kariyer Yolu",
  subtitle:
    "Perakende planlamada başlangıçtan uzmanlığa — gerçek kurslarla adım adım ilerleyin.",
  heroEyebrow: "Uzmanlık Akademisi",
  outcomes: [
    "Open To Buy hazırlayabilir ve retail budget disiplinini uygulayabilir",
    "Stock, option ve range plan tasarlayabilir",
    "Store capacity ve envanter kararlarını veriye dayalı alabilir",
    "Allocation ve replenishment mantığını iş süreçlerine uygulayabilir",
    "AI destekli forecast ve raporlama araçlarını kullanabilir",
    "Merchandise / Retail Planner rolüne hazırlanabilir",
  ],
  steps: [
    {
      level: "Başlangıç",
      label: "Perakende Planlamaya Giriş",
      slug: "perakande-muhendisligine-giris-planlama",
      fallbackTitle: "Perakende Mühendisliğine Giriş: Planlama",
      description:
        "Planlama fonksiyonunun perakende mühendisliğindeki rolünü ve kariyer haritasını öğrenin.",
    },
    {
      level: "Temel",
      label: "Planlama & Verinin Gücü",
      slug: "planlama",
      fallbackTitle: "Planlama ve İstatistik: Verinin Gücü",
      description:
        "Perakende kararlarında veri okuryazarlığı ve planlama temellerini güçlendirin.",
    },
    {
      level: "Orta",
      label: "Option, Range & Stock Plan",
      slug: "musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan",
      fallbackTitle: "Stock Option Plan, Tasarım Option Plan ve Range Plan",
      description:
        "Müşteri talebini veriye dökün; OTB ve range planlamanın pratik adımlarını uygulayın.",
    },
    {
      level: "İleri",
      label: "Envanter & Tedarik Zinciri",
      slug: "tedarik-zinciri-yonetimi",
      fallbackTitle: "Tedarik Zinciri Yönetimi",
      description:
        "Envanter, replenishment ve tedarik kararlarını bütüncül planlama ile birleştirin.",
    },
    {
      level: "Uzman",
      label: "AI Destekli Planlama",
      slug: "google-turkiye-uretkenliginizi-yapay-zeka-ile-artirin",
      fallbackTitle: "Üretkenliğinizi Yapay Zeka ile Artırın",
      description:
        "Forecast, raporlama ve tekrarlayan planlama görevlerinde AI araçlarını devreye alın.",
    },
  ],
  milestones: [...SHARED_MILESTONES],
  catalogHref: "/kurslar?kategori=planlama",
  catalogLabel: "Planlama kursları",
  closingTitle: "Perakende planlamada uzmanlaşmaya hazır mısınız?",
  closingDescription:
    "Tüm planlama kataloğunu keşfedin veya kurumsal paketler için ekibimizle görüşün.",
};

export const HR_CAREER_PATH: CareerPathDefinition = {
  slug: "insan-kaynaklari",
  title: "İnsan Kaynakları Kariyer Yolu",
  subtitle:
    "İK fonksiyonundan dijital ve analitik İK uzmanlığına — işe alımdan çalışan deneyimine.",
  heroEyebrow: "İK Uzmanlık Akademisi",
  outcomes: [
    "İK stratejisini iş hedefleriyle hizalayabilir",
    "İşe alım ve performans yönetimi süreçleri kurabilir",
    "Ücret, eğitim ve çalışan deneyimi programları tasarlayabilir",
    "İşveren markası ve bağlılık (engagement) ölçümleri yönetebilir",
    "İK analitiği ile veriye dayalı insan kaynağı kararları alabilir",
    "Dijital İK ve AI destekli süreçlerde çalışabilir",
  ],
  steps: [
    {
      level: "Başlangıç",
      label: "İK Fonksiyonu & İşe Alım",
      slug: "insan-kaynaklari-part-1-insan-kaynaklarinin-rolu-ise-alim-ve-performans-yonetimi",
      fallbackTitle:
        "İnsan Kaynakları Part 1: Rol, İşe Alım ve Performans Yönetimi",
      description:
        "İK'nın stratejik rolü, işe alım ve performans yönetiminin temelleri.",
    },
    {
      level: "Temel",
      label: "Eğitim, Ücret & Çalışan Deneyimi",
      slug: "insan-kaynaklari-part-2-egitim-ucret-calisan-deneyimi-baglilik-isveren-markasi-dijital-ik",
      fallbackTitle: "İnsan Kaynakları Part 2: Eğitim, Ücret, Dijital İK",
      description:
        "Ücret yönetimi, çalışan deneyimi, bağlılık ve işveren markası.",
    },
    {
      level: "Orta",
      label: "İK Analitiği",
      slug: "insan-kaynaklari-analitigi",
      fallbackTitle: "İnsan Kaynakları Analitiği",
      description:
        "Turnover, yetenek ve verimlilik metrikleriyle İK kararlarını güçlendirin.",
    },
    {
      level: "İleri",
      label: "Dijital İK & Otomasyon",
      slug: "google-turkiye-yapay-zeka-ile-gorevleri-otomatiklestirin",
      fallbackTitle: "Yapay Zeka ile Görevleri Otomatikleştirin",
      description:
        "Tekrarlayan İK süreçlerinde AI araçlarıyla verimlilik kazanın.",
    },
    {
      level: "Uzman",
      label: "İK'da Üretken AI",
      slug: "google-turkiye-uretkenlik-icin-yapay-zeka-destekli-araclar",
      fallbackTitle: "Üretkenlik için Yapay Zeka Destekli Araçlar",
      description:
        "Politika, iletişim ve raporlama süreçlerinde üretken AI kullanımı.",
    },
  ],
  milestones: [...SHARED_MILESTONES],
  catalogHref: "/kurslar?kategori=insan-kaynaklari",
  catalogLabel: "İK kursları",
  closingTitle: "İK kariyerinizi bir üst seviyeye taşıyın",
  closingDescription:
    "İnsan kaynakları kurslarını keşfedin veya kurumsal İK akademisi için teklif alın.",
};

export const AI_CAREER_PATH: CareerPathDefinition = {
  slug: "yapay-zeka",
  title: "Yapay Zeka Kariyer Yolu",
  subtitle:
    "AI okuryazarlığından LLM geliştirmeye — iş yerinde ve teknik rollerde yapay zeka uzmanlığı.",
  heroEyebrow: "AI Uzmanlık Akademisi",
  outcomes: [
    "Yapay zekanın iş süreçlerindeki rolünü açıklayabilir",
    "Etkili prompt ve AI araçları ile üretkenlik artırabilir",
    "İçerik üretimi, özetleme ve otomasyon senaryoları kurabilir",
    "Üretken AI ve büyük dil modellerinin mantığını anlayabilir",
    "LLM tabanlı uygulama geliştirmeye giriş yapabilir",
    "AI destekli ürün ve süreç rollerine hazırlanabilir",
  ],
  steps: [
    {
      level: "Başlangıç",
      label: "Yapay Zekaya Genel Bakış",
      slug: "google-turkiye-yapay-zekaya-genel-bakis",
      fallbackTitle: "Yapay Zekaya Genel Bakış",
      description: "AI kavramları, kullanım alanları ve iş dünyasındaki etkisi.",
    },
    {
      level: "Temel",
      label: "Prompt & Etkili Kullanım",
      slug: "google-turkiye-yapay-zekayi-etkili-istemler-ile-kullanin",
      fallbackTitle: "Yapay Zekayı Etkili İstemler ile Kullanın",
      description: "Doğru prompt teknikleri ve güvenilir AI çıktıları.",
    },
    {
      level: "Orta",
      label: "Üretkenlik & İçerik",
      slug: "google-turkiye-yapay-zeka-ile-icerik-uretin",
      fallbackTitle: "Yapay Zeka ile İçerik Üretin",
      description:
        "Rapor, sunum ve iş içeriklerinde üretken AI'dan maksimum verim.",
    },
    {
      level: "İleri",
      label: "LLM & Üretken AI",
      slug: "tubitak-bilgem-uretken-yapay-zeka-ve-buyuk-dil-modelleri-bilgem-techtalks-teknoloji-konusmalari",
      fallbackTitle: "Üretken Yapay Zeka ve Büyük Dil Modelleri",
      description:
        "Büyük dil modellerinin mimarisi ve kurumsal kullanım senaryoları.",
    },
    {
      level: "Uzman",
      label: "Sıfırdan LLM Geliştirme",
      slug: "new-course-8",
      fallbackTitle: "Sıfırdan LLM Geliştirme (Part 1)",
      description:
        "Kendi LLM uygulamalarınızı geliştirmeye yönelik teknik temeller.",
    },
  ],
  milestones: [...SHARED_MILESTONES],
  catalogHref: "/kurslar?kategori=ai",
  catalogLabel: "Yapay zeka kursları",
  closingTitle: "Yapay zeka uzmanlığınızı inşa edin",
  closingDescription:
    "AI kurs kataloğunu keşfedin veya kurumsal dijital dönüşüm paketleri için iletişime geçin.",
};

export const CAREER_PATHS: CareerPathDefinition[] = [
  RETAIL_PLANNING_PATH,
  HR_CAREER_PATH,
  AI_CAREER_PATH,
];

export const CAREER_PATH_SUMMARIES: CareerPathSummary[] = [
  {
    slug: RETAIL_PLANNING_PATH.slug,
    title: RETAIL_PLANNING_PATH.title,
    description: RETAIL_PLANNING_PATH.subtitle,
    highlight: "OTB · Range Plan · Forecast",
    href: `/kariyer-yolu/${RETAIL_PLANNING_PATH.slug}`,
  },
  {
    slug: HR_CAREER_PATH.slug,
    title: HR_CAREER_PATH.title,
    description: HR_CAREER_PATH.subtitle,
    highlight: "İşe Alım · İK Analitiği · Dijital İK",
    href: `/kariyer-yolu/${HR_CAREER_PATH.slug}`,
  },
  {
    slug: AI_CAREER_PATH.slug,
    title: AI_CAREER_PATH.title,
    description: AI_CAREER_PATH.subtitle,
    highlight: "Prompt · LLM · Üretken AI",
    href: `/kariyer-yolu/${AI_CAREER_PATH.slug}`,
  },
];

export function getCareerPathBySlug(slug: string): CareerPathDefinition | undefined {
  return CAREER_PATHS.find((path) => path.slug === slug);
}
