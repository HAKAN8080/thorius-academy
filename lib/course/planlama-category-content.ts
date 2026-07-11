export interface PlanlamaCategoryCourseContent {
  course_slug: string;
  title?: string;
  subtitle?: string;
  description_md?: string;
  what_will_learn?: string;
  target_audience?: string;
  title_en?: string;
  subtitle_en?: string;
  description_md_en?: string;
  what_will_learn_en?: string;
  target_audience_en?: string;
  subtitle_language?: string | null;
}

/** Planlama kategorisi — 5 yayınlanmış kurs, çift yönlü TR/EN */
export const PLANLAMA_CATEGORY_CONTENT: PlanlamaCategoryCourseContent[] = [
  {
    course_slug:
      "musteri-taleplerini-verilere-dokmenin-yolu-stock-option-plan-tasarim-option-plan-ve-range-plan",
    subtitle:
      "Perakende sektöründe ürün yönetimi, koleksiyon planlama ve stratejik stok tahsisi alanlarında Stock Option, Option Plan ve Range Plan yaklaşımlarını öğrenin.",
    description_md: `Bu eğitim, özellikle perakende sektöründe ürün yönetimi, koleksiyon planlama ve stratejik stok tahsisi alanlarında çalışan profesyoneller için tasarlanmıştır.

Eğitimde sırasıyla Stock Option kavramını, mağaza kapasitesi üzerinden nasıl planlandığını, bu planların tasarım ve ürün çeşitliliğiyle nasıl ilişkilendirildiğini öğreneceksiniz.

Option Plan ve Range Plan yaklaşımları ile hem sezon başında hem de sezon içinde alınacak kararların nasıl temellendirileceğini birlikte analiz edeceğiz.

Ayrıca Boston Matrisi (Boston Consulting Group Modeli) aracılığıyla ürünlerin stratejik konumlarını belirlemeyi, hangi ürünlerin desteklenmesi, hangilerinin elenmesi gerektiğine dair karar süreçlerini sade bir yaklaşımla öğreneceksiniz.

Uygulamalı örnekler, sektör içgörüleri ve saha deneyimine dayalı yöntemlerle desteklenen bu eğitim, sadece teorik bilgiyi değil, günlük operasyonlara uygulanabilir pratik karar sistemlerini de içermektedir.

### Kimler için uygun?

- Planlama, buying, ürün yönetimi, kategori yönetimi ve perakende strateji ekipleri
- Moda, hazır giyim, ev tekstili ve hızlı tüketim sektörlerinde çalışan profesyoneller
- Koleksiyon sürecine stratejik katkı sunmak isteyen tasarım ve AR-GE ekipleri

### Eğitim sonunda şunları yapabileceksiniz:

- Mağaza kapasitesi üzerinden doğru ürün karışımını planlamak
- Stok dağılımını müşteri içgörüsüne ve performansa göre şekillendirmek
- Option kavramını, sadece adet değil strateji bazlı yorumlayabilmek
- Boston Matrisi ile ürün portföyünüzü objektif şekilde değerlendirmek
- Range Plan oluştururken sezgiden değil veriden yola çıkmak

Eğitimin tüm bölümleri sade, açıklayıcı ve seslendirilmiş olarak sunulmuştur.`,
    what_will_learn: `Mağaza kapasitesi üzerinden doğru ürün karışımını planlamak
Stok dağılımını müşteri içgörüsüne ve performansa göre şekillendirmek
Option kavramını strateji bazlı yorumlayabilmek
Boston Matrisi ile ürün portföyünü objektif değerlendirmek
Range Plan oluştururken veriden yola çıkmak`,
    target_audience: `Planlama, buying ve ürün yönetimi ekipleri
Moda ve hızlı tüketim sektörü profesyonelleri
Koleksiyon sürecine katkı sunan tasarım ve AR-GE ekipleri`,
    title_en: "Stock Option Plan, Design Option Plan and Range Plan",
    subtitle_en:
      "Learn stock option planning, design option plans, and range planning for retail assortment and capacity decisions.",
    description_md_en: `This course is designed for professionals working in product management, collection planning, and strategic stock allocation—especially in retail.

You will learn the stock option concept, how planning is built around store capacity, and how these plans connect to design and product breadth.

Together we will analyse how **Option Plan** and **Range Plan** approaches ground decisions at the start of the season and throughout the season.

You will also learn to use the **Boston Matrix (BCG model)** to define products' strategic positions and decide which lines to support and which to exit—explained in a clear, practical way.

Supported by applied examples, industry insight, and field-tested methods, this course delivers decision systems you can use in daily operations—not theory alone.

### Who is this for?

- Planning, buying, product management, category management, and retail strategy teams
- Professionals in fashion, ready-to-wear, home textiles, and fast-moving consumer goods
- Design and R&D teams who want to contribute strategically to the collection process

### By the end of this course you will be able to:

- Plan the right product mix based on store capacity
- Shape stock distribution using customer insight and performance
- Interpret the option concept as a strategy—not only as units
- Evaluate your product portfolio objectively with the Boston Matrix
- Build range plans from data, not intuition

All sections are presented clearly with voice narration.`,
    what_will_learn_en: `Plan the right product mix based on store capacity
Shape stock distribution using customer insight and performance
Interpret options as a strategic lever, not only unit counts
Evaluate portfolios with the Boston Matrix
Build range plans from data, not intuition`,
    target_audience_en: `Planning, buying, and product management teams
Fashion and FMCG retail professionals
Design and R&D teams contributing to collections`,
  },
  {
    course_slug: "sgs",
    subtitle_language: "Türkçe",
    description_md: `**Türkçe altyazılı.** Bu eğitim, ürün yönetimi ile stok finansmanına dair finansal bakışı bir araya getirir.

Çoğu stok eğitimi stok fazlasını bir tedarik zinciri bulmacası olarak ele alır. Bu eğitim ise konuyu gerçekte olduğu gibi ele alır: **bir nakit problemi**. Stoktaki her ek gün, satılsa da satılmasa da bilançonuzda donmuş para demektir ve yılda %20–30 maliyet yaratır.

Önce stokun neden donmuş nakit olduğunu ve tek bir metrik olan **Stok Gün Sayısı (DIO)**'nın finans dilini planlamacının haftalık kaldıraçlarıyla nasıl bağladığını öğreneceksiniz. DIO azaltmanın ne kadar nakit serbest bıraktığını hesaplayacaksınız (örnek vakada 31 gün azaltma, ek satış olmadan €6,3M serbest bırakır).

Ardından temel beceri gelir: **toplama asla bakmayın**. DIO'yu dört eksende—kanal, zaman, kategori ve yaş—parçalamayı ve nakdinizi kilitleyen hücreyi ortaya çıkaran bir ısı haritası oluşturmayı öğreneceksiniz.

Stok fazlasını yaratan yedi maliyetli hatayı—ortalamayı yönetmekten indirimleri geciktirmeye, tahmin hatasını stokla gizlemeye kadar—ve her biri için somut çözümleri inceleyeceksiniz. Son olarak her şeyi önceliklendirilmiş 90 günlük bir plana sıralayacaksınız.

### Kimler için?

- Mevsimsel stok yöneten perakende planlamacıları ve buyer'lar
- Planlama ile ortak bir dil kurmak isteyen finans ve operasyon liderleri
- Stok sağlığı ve nakit serbest bırakmadan sorumlu kategori yöneticileri

### Eğitim sonunda şunları yapabileceksiniz:

- Stok günlerini nakit etkisine çevirmek
- Stok fazlasını kanal, ay ve kategoriye göre segmentlemek
- Uygulanabilir 90 günlük stok azaltma planı oluşturmak
- Stok aksiyonlarını finans ekiplerinin anlayacağı dilde sunmak`,
    what_will_learn: `DIO'yu bilançodaki nakit serbest bırakmaya bağlamak
Kanal ve kategori ısı haritaları oluşturmak
Stok fazlası yaratan yedi hatadan kaçınmak
90 günlük stok azaltma planı oluşturmak`,
    target_audience: `Perakende planlamacıları ve buyer'lar
Finans ve operasyon yöneticileri
Stok sağlığına odaklanan kategori yöneticileri`,
    title_en: "Improve Days of Supply: Inventory Financing",
    subtitle_en:
      "Turkish subtitles. Analyse excess stock by channel and category, then build a 90-day reduction plan using the Days of Inventory (DIO) framework.",
    description_md_en: `**Turkish subtitles.** This course connects product management with a financial view of inventory.

Most inventory programmes treat overstock as a supply-chain puzzle. This course treats it as what it really is—a **cash problem**. Every extra day of stock is money frozen on your balance sheet, costing you 20–30% per year whether it sells or not.

You will learn why inventory is frozen cash and how a single metric—**Days of Inventory (DIO)**—links finance language to the levers planners pull every week. You will calculate exactly how much cash a DIO reduction releases (in our worked example, cutting 31 days frees €6.3M with no extra sales).

Then comes the core skill: **never look at the total alone**. You will break DIO across four axes—channel, time, category, and age—and build a heat map that exposes the exact cell trapping your cash.

You will study the costly mistakes that build overstock in the first place—from managing the average, to delaying markdowns, to hiding forecast error inside healthy-looking totals—and how to avoid them.

### Who is this for?

- Retail planners and buyers managing seasonal inventory
- Finance and operations leaders who need a shared language with planning
- Category managers responsible for stock health and cash release

### By the end of this course you will be able to:

- Translate inventory days into cash impact
- Segment overstock by channel, month, and category
- Build a practical 90-day stock reduction plan
- Present inventory actions in language finance teams understand`,
    what_will_learn_en: `Connect DIO to cash release on the balance sheet
Build channel and category heat maps for overstock
Avoid the seven mistakes that create excess inventory
Create a 90-day stock reduction plan`,
    target_audience_en: `Retail planners and buyers
Finance and operations managers
Category managers focused on stock health`,
  },
  {
    course_slug: "aitools4planners",
    title_en: "AI-Powered Tools for Retail Planners and Buyers",
    subtitle_en:
      "Master AI-assisted demand forecasting, OTB planning, allocation, markdown management, and supplier collaboration.",
    description_md_en: `This course teaches how to use artificial intelligence in retail planning—comprehensively and hands-on.

Retail planning still runs largely on spreadsheets, gut feel, and end-of-season surprises. AI changes that fundamentally.

Retail planners, buyers, and merchandising professionals will learn to use tools such as **Claude, ChatGPT, and Microsoft Copilot** to make faster, smarter, and more accurate decisions across the planning cycle.

**No coding required. No data science background needed.**

### What you will learn

- Why AI is transforming retail planning and how it affects your role
- Build demand forecasts and spot seasonal patterns with AI prompts
- Use AI in **OTB (Open-to-Buy)** calculations, assortment mix analysis, and product decisions
- Score and prioritise allocation with AI logic
- Simulate markdown scenarios to protect gross margin with AI support
- Build a reusable prompt library and a weekly AI planning routine
- Develop category-specific AI strategies for fashion, hardlines, and perishables
- Strengthen supplier and supply-chain collaboration with AI
- Combine multiple AI models and build planning assistants for your organisation
- Prepare a 30-60-90 day AI adoption roadmap for your team

### Who is this for?

- Merchandise planners, retail buyers, allocation analysts, and store operations managers
- Any retail professional who wants to work smarter with AI—without becoming a data scientist`,
    what_will_learn_en: `Use AI prompts for demand forecasting and seasonality
Apply AI to OTB, assortment, and allocation decisions
Simulate markdown scenarios with AI support
Build a weekly AI planning routine and prompt library
Create a 30-60-90 day AI adoption roadmap`,
    target_audience_en: `Merchandise planners and retail buyers
Allocation analysts and store operations managers
Retail professionals adopting AI without a data science background`,
  },
  {
    course_slug: "planlama",
    subtitle:
      "Perakende sektöründe veriye dayalı kararlar almak isteyenler için kümeleme tekniklerini öğrenin.",
    description_md: `Perakende sektöründe veriye dayalı kararlar almak isteyenler için kümeleme (clustering) tekniklerini öğrenin!

### Neler öğreneceksiniz?

**Müşteri segmentasyonu:** RFM analizi ile müşterileri gruplayarak kişiselleştirilmiş pazarlama stratejileri geliştirme. Müşterilerinize doğru marka ya da ürün karışımı sunabilmek için segmente ederek doğru ürünle buluşturma.

**Mağaza gruplama:** Benzer performansa sahip mağazaları kümeleyerek optimize stok ve personel yönetimi.

**Ürün kümeleme:** Ürün benzerliklerini bulup kategori optimizasyonu yaparak satış artırıcı öneriler sunma.

**Gerçek vaka çalışmaları:** Perakende veri setleri üzerinde Python/R uygulamaları (Pandas, Scikit-learn).

**En iyi pratikler:** Model seçimi, metrikler (silhouette, elbow method) ve sonuçları yorumlama.

### Kurs sonunda

- Müşteri davranışlarını anlayıp CRM stratejilerinizi güçlendireceksiniz
- Mağaza ve ürün verimliliğini otomatik raporlarla takip edebileceksiniz
- Veri bilimini perakende alanında pratik projelerle deneyimlemiş olacaksınız
- Farklı sektörlere uyarlanabilir analitik beceriler kazanacaksınız
- Satış ve operasyon ekipleriyle veri odaklı iletişim kurabileceksiniz

### Kimler katılmalı?

Veri analistleri, perakende yöneticileri, pazarlama uzmanları ve ML meraklıları. Temel Python/R ve istatistik bilgisi yeterlidir.`,
    what_will_learn: `RFM ile müşteri segmentasyonu
Mağaza gruplama ve stok optimizasyonu
Ürün kümeleme ve kategori optimizasyonu
Python/R ile perakende analitik uygulamaları
Model seçimi ve sonuç yorumlama`,
    target_audience: `Veri analistleri ve perakende yöneticileri
Pazarlama uzmanları
Temel Python/R bilgisine sahip ML meraklıları`,
    title_en: "Planning and Statistics: The Power of Data",
    subtitle_en:
      "Learn clustering techniques for data-driven retail decisions—customer segmentation, store grouping, and product clustering.",
    description_md_en: `Learn clustering techniques for professionals who want to make data-driven decisions in retail.

### What you will learn

**Customer segmentation:** Group customers with RFM analysis to develop personalised marketing strategies and match the right product mix to each segment.

**Store clustering:** Cluster stores with similar performance to optimise stock and staffing.

**Product clustering:** Find product similarities, optimise categories, and generate sales-boosting recommendations.

**Real case studies:** Python/R applications on retail datasets (Pandas, Scikit-learn).

**Best practices:** Model selection, metrics (silhouette, elbow method), and interpreting results.

### By the end of this course

- You will understand customer behaviour and strengthen CRM strategies
- You will track store and product efficiency with automated reports
- You will have hands-on experience applying data science in retail
- You will gain analytics skills adaptable across sectors
- You will communicate data-driven insights with sales and operations teams

### Who should attend?

Data analysts, retail managers, marketing specialists, and ML enthusiasts. Basic Python/R and statistics knowledge is sufficient.`,
    what_will_learn_en: `Customer segmentation with RFM
Store clustering and stock optimisation
Product clustering and category optimisation
Retail analytics with Python/R
Model selection and result interpretation`,
    target_audience_en: `Data analysts and retail managers
Marketing specialists
ML enthusiasts with basic Python/R knowledge`,
  },
  {
    course_slug: "perakande-muhendisligine-giris-planlama",
    subtitle:
      "Perakende sektöründe başarılı bir kariyer hedefleyenler için perakende ve planlama süreçlerinin temel prensiplerini kapsamlı şekilde öğrenin.",
    description_md: `**Perakende Mühendisliği: Planlamaya Giriş**

Perakende sektöründe başarılı bir kariyer hedefleyenler için tasarlanan bu kurs, perakende ve planlama süreçlerinin temel prensiplerini kapsamlı bir şekilde ele alıyor. Katılımcılara perakende sektörünün dinamiklerini, planlama matematiğini ve stratejik yaklaşımlarını öğretmeyi amaçlıyor.

Kursun ilk bölümünde global ve yerel perakende sektörüne dair genel bir bakış sunuluyor. Katılımcılar, perakende sektörünün tarihçesi, gelişimi ve mevcut trendleri hakkında bilgi edinerek sektöre dair sağlam bir temel oluşturuyor.

İlerleyen bölümlerde perakende planlamasının kritik unsurları detaylı inceleniyor. Stok yönetimi, talep tahminleri, ürün yerleşimi ve fiyatlandırma stratejileri teorik bilgiler ve pratik uygulamalarla desteklenerek aktarılıyor.

Kurs boyunca gerçek dünya örnekleri ve vaka çalışmalarıyla teorik bilgiler pekiştiriliyor. İnteraktif içerikler ve değerlendirme testleri ile öğrenme süreci destekleniyor.

### Kimler için?

- Perakende sektöründe kariyer yapmayı hedefleyen yeni mezunlar
- Bilgi ve becerilerini güncellemek isteyen sektör profesyonelleri
- Perakende işletmelerinde planlama süreçlerini daha iyi anlamak isteyen herkes

Kursu tamamlayan katılımcılar, perakende planlamasının temel prensiplerini kavrayarak sektördeki rekabet avantajlarını artırma fırsatı yakalayacak.`,
    what_will_learn: `Perakende sektörünün temel dinamikleri
Stok yönetimi ve talep tahmini
Ürün yerleşimi ve fiyatlandırma stratejileri
Perakende planlama matematiği`,
    target_audience: `Perakende sektöründe kariyer hedefleyen yeni mezunlar
Bilgilerini güncellemek isteyen sektör profesyonelleri
Planlama süreçlerini öğrenmek isteyen perakende çalışanları`,
    title_en: "Introduction to Retail Engineering: Planning",
    subtitle_en:
      "Learn the fundamentals of retail and planning processes for a successful career in the retail sector.",
    description_md_en: `**Introduction to Retail Engineering: Planning**

Designed for those aiming for a successful career in retail, this course comprehensively covers the fundamental principles of retail and planning processes. It teaches retail dynamics, planning mathematics, and strategic approaches.

The first section provides an overview of the global and local retail sector. Participants build a solid foundation by learning the history, evolution, and current trends of retail.

Later sections examine critical elements of retail planning in detail. Topics such as inventory management, demand forecasting, product placement, and pricing strategies are delivered with theory and practical application.

Throughout the course, real-world examples and case studies reinforce learning. Interactive content and assessment tests support the learning process.

### Who is this for?

- New graduates aiming for a career in retail
- Industry professionals who want to update their skills
- Anyone who wants to better understand planning processes in retail businesses

Participants who complete the course will grasp the fundamentals of retail planning and gain a competitive edge in the sector.`,
    what_will_learn_en: `Fundamentals of retail sector dynamics
Inventory management and demand forecasting
Product placement and pricing strategies
Retail planning mathematics`,
    target_audience_en: `New graduates targeting retail careers
Industry professionals updating their skills
Retail employees learning planning processes`,
  },
];

const planlamaBySlug = new Map(
  PLANLAMA_CATEGORY_CONTENT.map((entry) => [entry.course_slug, entry]),
);

export function getPlanlamaCategoryContent(
  courseSlug: string,
): PlanlamaCategoryCourseContent | undefined {
  return planlamaBySlug.get(courseSlug);
}
