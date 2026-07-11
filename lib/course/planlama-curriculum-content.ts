export interface PlanlamaCurriculumI18n {
  course_slug: string;
  /** TR title → EN title (TR-first courses) */
  sections: Record<string, string>;
  lessons: Record<string, string>;
  /** EN title → TR title (EN-first courses: sgs, aitools4planners) */
  sections_tr?: Record<string, string>;
  lessons_tr?: Record<string, string>;
}

export const PLANLAMA_CURRICULUM_I18N: PlanlamaCurriculumI18n[] = [
  {
    course_slug:
      "musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan",
    sections: {
      Giriş: "Introduction",
      "Stock Option": "Stock Option",
      "Tasarım Option Plan": "Design Option Plan",
      "Range Plan": "Range Plan",
      Kapanış: "Closing",
    },
    lessons: {
      Giriş: "Introduction",
      İçerik: "Overview",
      "Stock Option Nedir?": "What Is a Stock Option?",
      "Stock Option Plan Toplantısı Katılımcıları":
        "Stock Option Plan Meeting Participants",
      "Stock Option Plan Hazırlık Süreci":
        "Stock Option Plan Preparation Process",
      "Stock Option Toplantısı Periyotları":
        "Stock Option Meeting Cadence",
      "Stock Option Plan Belirleme": "Defining the Stock Option Plan",
      "Stock Option Plan Belirleme Detay":
        "Stock Option Plan Definition (Detail)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (1. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 1)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (2. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 2)",
      "Örnek: Bir Hazır Giyim Firması – Stock Option Çalışması (3. Aşama)":
        "Case Study: Apparel Retailer Stock Option Work (Stage 3)",
      "Tasarım Option Planı Nedir?": "What Is a Design Option Plan?",
      "Tasarım Option Plan Gant Örneği":
        "Design Option Plan Gantt Chart Example",
      "Range Plan Nedir?": "What Is a Range Plan?",
      "Range Plan Kriterlerinin Belirlenmesi":
        "Defining Range Plan Criteria",
      "Boston Matrisi (BCG) Nedir Planlamada Nasıl Kullanılır?":
        "Boston Matrix (BCG): What It Is and How Planners Use It",
      "Range Belirlerken Hangi Yol İzlenir?": "How to Build a Range Plan",
      "Rekabet Analizi ve Fiyat Rekabeti":
        "Competitive Analysis and Price Competition",
      Kapanış: "Closing",
    },
  },
  {
    course_slug: "sgs",
    sections: {},
    lessons: {},
    sections_tr: {
      "Section 1: Inventory, Cash & the KPI Bridge":
        "Bölüm 1: Stok, Nakit ve KPI Köprüsü",
      "Section 2: Measuring DIO Correctly":
        "Bölüm 2: DIO'yu Doğru Ölçmek",
      "Section 3: The Diagnostic Method — Never Look at the Total":
        "Bölüm 3: Teşhis Yöntemi — Toplama Asla Bakmayın",
      "Section 4: The Seven Costly Mistakes":
        "Bölüm 4: Yedi Maliyetli Hata",
      "Section 5: Improvement Playbook & 90-Day Plan":
        "Bölüm 5: İyileştirme Planı ve 90 Günlük Program",
    },
    lessons_tr: {
      "Reduce Days of Stock — Course Introduction":
        "Stok Gün Sayısını Azaltın — Kurs Girişi",
      "Seven Lessons, One Bridge — Section Roadmap":
        "Yedi Ders, Bir Köprü — Bölüm Yol Haritası",
      "Inventory Is Frozen Cash": "Stok Dondurulmuş Nakittir",
      "Days of Inventory — The Formula": "Stok Gün Sayısı — Formül",
      "The Cash Conversion Cycle": "Nakit Döngüsü",
      "Two Languages, One Business": "İki Dil, Tek İş",
      "The KPI Tree": "KPI Ağacı",
      "GMROI — The Bridge Metric": "GMROI — Köprü Metriği",
      "Which Lever Moves Which KPI":
        "Hangi Kaldıraç Hangi KPI'yı Hareket Ettirir",
      "Section Overview — Getting the Number Right":
        "Bölüm Özeti — Doğru Rakamı Elde Etmek",
      "Hidden Stock: Returns, In-Transit & Consignment":
        "Gizli Stok: İadeler, Transit ve Konsinye",
      "Average vs Closing, Cost vs Retail":
        "Ortalama vs Kapanış, Maliyet vs Perakende",
      "Rolling vs Point-in-Time": "Yuvarlanan vs Anlık",
      "The Seasonality Trap": "Mevsimsellik Tuzağı",
      "Building Your DIO Baseline": "DIO Baz Çizginizi Oluşturma",
      "Section 1 Recap": "Bölüm 1 Özeti",
      "Section Overview — The Core of the Course":
        "Bölüm Özeti — Kursun Özü",
      "The Diagnostic Principle": "Teşhis İlkesi",
      "The Four Axes Framework": "Dört Eksen Çerçevesi",
      "Axis 1 — Channel": "Eksen 1 — Kanal",
      "Axis 2 — Time: Which Month Hurts?":
        "Eksen 2 — Zaman: Hangi Ay Zarar Veriyor?",
      "Axis 3 — Category: NOS vs Fashion":
        "Eksen 3 — Kategori: NOS vs Moda",
      "Axis 4 — Age & Terminal Stock":
        "Eksen 4 — Yaş ve Terminal Stok",
      "The Heat Map & Case Walkthrough":
        "Isı Haritası ve Vaka İncelemesi",
      "Reading the Phasing Gap": "Fazlama Boşluğunu Okuma",
      "Section 2 Recap": "Bölüm 2 Özeti",
      "Section 3 Recap": "Bölüm 3 Özeti",
      "Section Overview — Where Overstock Comes From":
        "Bölüm Özeti — Stok Fazlası Nereden Gelir",
      "The Mistake Map": "Hata Haritası",
      "Mistakes 1 & 2 — The Average & The Early Buy":
        "Hatalar 1 ve 2 — Ortalama ve Erken Alım",
      "Mistake 3 — Delaying Markdowns":
        "Hata 3 — İndirimleri Geciktirmek",
      "Mistakes 4 & 5 — Uniform Safety Stock & Return Flows":
        "Hatalar 4 ve 5 — Tek Tip Güvenlik Stoğu ve İade Akışları",
      "Mistake 6 — OTB as Budget Theater":
        "Hata 6 — OTB'yi Bütçe Tiyatrosu Olarak Kullanmak",
      "Mistake 7 — Hiding Forecast Error with Stock":
        "Hata 7 — Tahmin Hatasını Stokla Gizlemek",
      "Section 4 Recap": "Bölüm 4 Özeti",
      "Section Overview — From Diagnosis to Cash":
        "Bölüm Özeti — Teşhisten Nakite",
      "The Lever Priority Matrix": "Kaldıraç Öncelik Matrisi",
      "Buying-Side & Selling-Side Levers":
        "Alım ve Satım Tarafı Kaldıraçları",
      "Assortment Levers & Payoff Horizon":
        "Ürün Karması Kaldıraçları ve Geri Ödeme Ufku",
      "The 90-Day Roadmap": "90 Günlük Yol Haritası",
      "Course Wrap-Up & Next Steps": "Kurs Özeti ve Sonraki Adımlar",
      "The DIO Diagnostic Toolkit": "DIO Teşhis Araç Seti",
    },
  },
  {
    course_slug: "aitools4planners",
    sections: {
      "AI4 Retail Planner & Buyer": "AI for Retail Planners & Buyers",
    },
    lessons: {},
    lessons_tr: {
      "Module1: Why retail needs ai now":
        "Modül 1: Perakendenin Neden Şimdi Yapay Zekâya İhtiyacı Var",
      "Module2: AI-Powered Demand Forecasting":
        "Modül 2: Yapay Zekâ Destekli Talep Tahmini",
      "Module3: Assortment & OTB Planning with AI":
        "Modül 3: Yapay Zekâ ile Ürün Karması ve OTB Planlaması",
      "Module4: Inventory & Allocation with AI":
        "Modül 4: Yapay Zekâ ile Stok ve Tahsis",
      "Module5: Markdown & Pricing Optimization":
        "Modül 5: İndirim ve Fiyat Optimizasyonu",
      "Module6: Building Your AI Plan":
        "Modül 6: Yapay Zekâ Planınızı Oluşturma",
      "Module7: Category specific AI App.":
        "Modül 7: Kategoriye Özel Yapay Zekâ Uygulamaları",
      "Module8: Vendor & Supply Chain Collaboration":
        "Modül 8: Tedarikçi ve Tedarik Zinciri İş Birliği",
      "Module9: Advanced AI Techniques for Buyers":
        "Modül 9: Satın Almacılar İçin İleri Düzey Yapay Zekâ Teknikleri",
      "Section 10: Implementation Roadmap & Next Steps":
        "Bölüm 10: Uygulama Yol Haritası ve Sonraki Adımlar",
    },
  },
  {
    course_slug: "planlama",
    sections: {
      "Perakende Analitiği: Veriye Dayalı Karar Vermenin Gücü":
        "Retail Analytics: The Power of Data-Driven Decisions",
      "Temel İstatistik Bilgisi": "Basic Statistics",
      Sınav: "Exam",
    },
    lessons: {
      "Perakende Analitiğine Giriş": "Introduction to Retail Analytics",
      "Veri Toplama ve Veri Kaynakları":
        "Data Collection and Data Sources",
      "Analitik Teknikler ve Araçlar":
        "Analytic Techniques and Tools",
      "Perakende Analitiğinin Uygulama Alanları":
        "Applications of Retail Analytics",
      "Örnek Olay : Zara Analitik Dünyası":
        "Case Study: Zara's Analytics World",
      "Gelecek ve Trendler": "Future and Trends",
      "İstatistiğe Giriş": "Introduction to Statistics",
      "Tanımlayıcı İstatistikler: Ortalama, Medyan, Mod":
        "Descriptive Statistics: Mean, Median, Mode",
      "Dağılım Kavramı, Görselleştirme, Korelasyon ve Regresyon":
        "Distribution, Visualization, Correlation and Regression",
      "Olasılık ve İstatistiksel Dağılımlar":
        "Probability and Statistical Distributions",
    },
  },
  {
    course_slug: "perakande-muhendisligine-giris-planlama",
    sections: {
      "Perakende Mühendisliği": "Retail Engineering",
    },
    lessons: {
      "Perakende Sektörü": "The Retail Sector",
      "Perakende Mühendisliği": "Retail Engineering",
      "Perakendenin 5 Doğrusu": "The Five Truths of Retail",
      "Ürün Değer Üçgeni": "Product Value Triangle",
      "Merchandising Matematiğiv": "Merchandising Mathematics",
    },
  },
];

const curriculumBySlug = new Map(
  PLANLAMA_CURRICULUM_I18N.map((entry) => [entry.course_slug, entry]),
);

export function getPlanlamaCurriculumI18n(
  courseSlug: string,
): PlanlamaCurriculumI18n | undefined {
  return curriculumBySlug.get(courseSlug);
}
