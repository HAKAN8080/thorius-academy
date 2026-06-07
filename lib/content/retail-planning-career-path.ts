export interface CareerPathStep {
  level: string;
  label: string;
  slug: string;
  fallbackTitle: string;
  description: string;
}

export interface CareerPathMilestone {
  label: string;
  description: string;
  href?: string;
}

export const RETAIL_PLANNING_CAREER_PATH = {
  slug: "retail-planning",
  title: "Retail Planning Kariyer Yolu",
  subtitle:
    "Perakende planlamada başlangıçtan uzmanlığa — gerçek kurslarla adım adım ilerleyin.",
  heroEyebrow: "Uzmanlık Akademisi",
} as const;

export const RETAIL_PLANNING_OUTCOMES = [
  "Open To Buy hazırlayabilir ve retail budget disiplinini uygulayabilir",
  "Stock, option ve range plan tasarlayabilir",
  "Store capacity ve envanter kararlarını veriye dayalı alabilir",
  "Allocation ve replenishment mantığını iş süreçlerine uygulayabilir",
  "AI destekli forecast ve raporlama araçlarını kullanabilir",
  "Merchandise / Retail Planner rolüne hazırlanabilir",
] as const;

export const RETAIL_PLANNING_STEPS: CareerPathStep[] = [
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
    fallbackTitle:
      "Stock Option Plan, Tasarım Option Plan ve Range Plan",
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
];

export const RETAIL_PLANNING_MILESTONES: CareerPathMilestone[] = [
  {
    label: "Sertifika",
    description:
      "Her kursu tamamladığınızda dijital katılım belgesi; yolu bitirdiğinizde uzmanlık portföyü.",
  },
  {
    label: "Thorius Coaching",
    description:
      "CV, mülakat ve kariyer hedefi için bire bir koçluk desteği.",
    href: "/#ecosystem",
  },
  {
    label: "Kurumsal mentorluk",
    description:
      "Şirket içi planlama ekipleri için özelleştirilmiş öğrenme paketleri.",
    href: "/kurumsal",
  },
];
