import type { PlanlamaCategoryCourseContent } from "@/lib/course/planlama-category-content";

const LLM_COURSE_DESCRIPTION_TR = `🔍 Bu kursta neler bulacaksınız?
✅ Tokenleştirme, embedding, attention gibi temel kavramlar
✅ Kodların satır satır açıklaması
✅ Google Colab ortamında çalışılabilir Jupyter Notebook
✅ Üç boyutlu görselleştirmeler ve animasyonlu anlatım
✅ Küçük bir GPT modeli eğitimi ve arayüzü
✅ Quiz'ler, ödevler ve etkileşimli öğrenme
✅ Açık kaynak dosyalar ve topluluk desteği

🧠 Bu kurs kimler için?
• Yapay zeka alanında kendini geliştirmek isteyen öğrenciler
• Mühendisler, istatistikçiler, araştırmacılar
• LLM'leri hem teoride hem pratikte anlamak isteyen herkes`;

const LLM_COURSE_DESCRIPTION_EN = `🔍 What you will find in this course:
✅ Core concepts such as tokenisation, embeddings and attention
✅ Line-by-line code explanations
✅ Jupyter Notebooks runnable in Google Colab
✅ 3D visualisations and animated explanations
✅ Training a small GPT model and building its interface
✅ Quizzes, assignments and interactive learning
✅ Open-source files and community support

🧠 Who is this for?
• Students developing skills in artificial intelligence
• Engineers, statisticians and researchers
• Anyone who wants to understand LLMs in theory and practice`;

/** Yapay Zeka + Tedarik Zinciri + Bilgi Teknolojileri — 11 ücretli kurs, çift yönlü TR/EN */
export const REMAINING_PAID_CATEGORY_CONTENT: PlanlamaCategoryCourseContent[] = [
  {
    course_slug: "claude-ai-masterclass-from-zero-to-power-user",
    subtitle:
      "Claude'ı sıfırdan öğrenin — model ailesi, rakip karşılaştırmaları, süper güçler ve prompt teknikleri.",
    description_md: `Claude AI Masterclass, Anthropic'in güvenlik odaklı yapay zekâ asistanını sıfırdan ileri seviyeye taşımanız için tasarlanmış kapsamlı bir eğitimdir.

Kurs boyunca Claude model ailesini (Opus, Sonnet, Haiku), ChatGPT ve Gemini ile karşılaştırmalı analizleri, Claude'ın öne çıktığı kullanım senaryolarını ve etkili prompt tekniklerini öğreneceksiniz.

### Kimler için?

- Yapay zekâ araçlarını iş veya kişisel projelerde kullanmak isteyenler
- Claude, ChatGPT ve Gemini arasında doğru aracı seçmek isteyen profesyoneller
- Prompt mühendisliği becerilerini geliştirmek isteyenler

### Eğitim sonunda şunları yapabileceksiniz:

- Claude model ailesini ve güçlü yönlerini tanımlamak
- Göreve göre doğru yapay zekâ aracını seçmek
- Claude için etkili prompt'lar yazmak`,
    what_will_learn: `Claude ve Anthropic ekosistemini tanımak
Claude, ChatGPT ve Gemini karşılaştırması
Claude'ın öne çıktığı 6 kullanım alanı
Claude için prompt teknikleri`,
    target_audience: `Yapay zekâ araçlarını aktif kullanan profesyoneller
Prompt mühendisliği öğrenmek isteyenler
Claude'ı iş akışına entegre etmek isteyenler`,
    title_en: "Claude AI Masterclass: From Zero to Power User",
    subtitle_en:
      "Learn Claude from scratch — model family, competitor comparisons, superpowers and prompt techniques.",
    description_md_en: `Claude AI Masterclass is a comprehensive programme designed to take you from beginner to power user with Anthropic's safety-first AI assistant.

You will learn the Claude model family (Opus, Sonnet, Haiku), side-by-side comparisons with ChatGPT and Gemini, the use cases where Claude excels, and effective prompt techniques.

### Who is this for?

- Professionals who want to use AI tools in work or personal projects
- Teams choosing between Claude, ChatGPT and Gemini
- Anyone building prompt engineering skills

### By the end of this course you will be able to:

- Describe the Claude model family and its strengths
- Choose the right AI tool for each task
- Write effective prompts for Claude`,
    what_will_learn_en: `Understanding Claude and the Anthropic ecosystem
Comparing Claude, ChatGPT and Gemini
Six areas where Claude outperforms other AIs
Prompt techniques for Claude`,
    target_audience_en: `Professionals actively using AI tools
Learners interested in prompt engineering
Teams integrating Claude into their workflows`,
  },
  {
    course_slug: "new-course-8",
    subtitle:
      "Sıfırdan LLM geliştirme yolculuğunun ilk bölümü — tokenizer'dan embedding'e, Ders 0–10.",
    description_md: LLM_COURSE_DESCRIPTION_TR,
    what_will_learn: `LLM terminolojisi ve temel kavramlar
Tokenizer geliştirme (Python, BPE, SentencePiece)
Veri seti hazırlama ve PyTorch DataLoader
Embedding katmanları ve anlam temsili`,
    target_audience: `Yapay zekâ ve LLM geliştirmeye ilgi duyanlar
Python ve PyTorch ile çalışan mühendisler
Teoriden pratiğe LLM öğrenmek isteyenler`,
    title_en: "LLM Development from Scratch (Part 1: Lessons 0–10)",
    subtitle_en:
      "Part 1 of the from-scratch LLM journey — from tokenisers to embeddings, Lessons 0–10.",
    description_md_en: LLM_COURSE_DESCRIPTION_EN,
    what_will_learn_en: `LLM terminology and core concepts
Building tokenisers (Python, BPE, SentencePiece)
Dataset preparation and PyTorch DataLoader
Embedding layers and semantic representation`,
    target_audience_en: `Learners interested in AI and LLM development
Engineers working with Python and PyTorch
Anyone learning LLMs from theory to practice`,
  },
  {
    course_slug: "sifirdan-llm-gelistirme-part1-ders-11-ders-20",
    subtitle:
      "Positional encoding'den self-attention'a — LLM geliştirmenin ikinci bölümü, Ders 11–20.",
    description_md: LLM_COURSE_DESCRIPTION_TR,
    what_will_learn: `Positional embedding ve encoding teknikleri (RoPE dahil)
Self-attention mekanizması ve QKV hesaplaması
Anlamsal yakınlık (Manhattan, kosinüs benzerliği)
Causal self-attention ve dropout`,
    target_audience: `LLM Part 1'i tamamlayan veya temel tokenizer bilgisine sahip olanlar
Transformer mimarisini kod düzeyinde öğrenmek isteyenler`,
    title_en: "LLM Development from Scratch (Part 2: Lessons 11–20)",
    subtitle_en:
      "From positional encoding to self-attention — Part 2 of LLM development, Lessons 11–20.",
    description_md_en: LLM_COURSE_DESCRIPTION_EN,
    what_will_learn_en: `Positional embedding and encoding (including RoPE)
Self-attention mechanism and QKV computation
Semantic similarity (Manhattan, cosine similarity)
Causal self-attention and dropout`,
    target_audience_en: `Learners who completed Part 1 or have basic tokeniser knowledge
Developers learning the Transformer architecture in code`,
  },
  {
    course_slug: "sifirdan-llm-gelistirme-part-3-ders-21-ders30",
    subtitle:
      "Multi-head attention'dan eğitim döngüsüne — LLM geliştirmenin üçüncü bölümü, Ders 21–30.",
    description_md: LLM_COURSE_DESCRIPTION_TR,
    what_will_learn: `Multi-head attention ve layer normalization
Decoder bloğu, LM head ve loss fonksiyonu
Optimizer, backpropagation ve eğitim döngüsü
Model kaydetme ve yükleme (PyTorch)`,
    target_audience: `LLM Part 2'yi tamamlayan katılımcılar
Transformer decoder'ı uçtan uca kodlamak isteyenler`,
    title_en: "LLM Development from Scratch (Part 3: Lessons 21–30)",
    subtitle_en:
      "From multi-head attention to the training loop — Part 3, Lessons 21–30.",
    description_md_en: LLM_COURSE_DESCRIPTION_EN,
    what_will_learn_en: `Multi-head attention and layer normalisation
Decoder block, LM head and loss function
Optimizer, backpropagation and training loop
Saving and loading models (PyTorch)`,
    target_audience_en: `Participants who completed Part 2
Developers building a Transformer decoder end to end`,
  },
  {
    course_slug: "sifirdan-llm-gelistirme-part-4-ders-31-ders40",
    subtitle:
      "Generate fonksiyonundan Gradio arayüzüne — LLM geliştirmenin son bölümü, Ders 31–41.",
    description_md: LLM_COURSE_DESCRIPTION_TR,
    what_will_learn: `Generate fonksiyonu ve Gradio chatbot arayüzü
GPU/MPS ile batch processing ve hızlandırma
Temperature, Top-P ve Top-K sampling
Yayına hazır notebook ve parametre kontrolü`,
    target_audience: `LLM Part 3'ü tamamlayan katılımcılar
Eğitilmiş modeli arayüzle yayınlamak isteyenler`,
    title_en: "LLM Development from Scratch (Part 4: Lessons 31–41)",
    subtitle_en:
      "From generate function to Gradio UI — the final part, Lessons 31–41.",
    description_md_en: LLM_COURSE_DESCRIPTION_EN,
    what_will_learn_en: `Generate function and Gradio chatbot interface
Batch processing and acceleration with GPU/MPS
Temperature, Top-P and Top-K sampling
Production-ready notebook and parameter controls`,
    target_audience_en: `Participants who completed Part 3
Developers deploying a trained model with a user interface`,
  },
  {
    course_slug: "last-mile",
    subtitle:
      "Tedarik zincirinin son kilometresi — last mile dağıtım modeli, maliyet ve SWOT analizi.",
    description_md: `📦 Last Mile Dağıtım Modeli Eğitimi

Tedarik zincirinin en kritik halkası olan "last mile delivery", müşteri memnuniyetini doğrudan etkileyen bir süreçtir.

Bu eğitimde last mile teslimat sürecinin temel prensiplerini, karşılaşılan operasyonel zorlukları ve verimlilik artırıcı stratejileri öğreneceksiniz. Maliyet analizi, SWOT değerlendirmesi ve Trendyol Go örnek projesi ile teoriyi pratiğe taşıyacaksınız.

### Kimler için?

- Lojistik ve tedarik zinciri profesyonelleri
- E-ticaret ve perakende operasyon yöneticileri
- Last mile optimizasyonu üzerinde çalışan planlamacılar`,
    what_will_learn: `Last mile dağıtım modelinin temelleri
Maliyet analizi ve SWOT değerlendirmesi
Gerçek dünya örnek proje (Trendyol Go)
Operasyonel verimlilik stratejileri`,
    target_audience: `Lojistik ve tedarik zinciri uzmanları
E-ticaret operasyon ekipleri
Last mile süreçlerini iyileştirmek isteyen yöneticiler`,
    title_en: "Last Mile Distribution Model",
    subtitle_en:
      "The final kilometre of the supply chain — distribution model, cost and SWOT analysis.",
    description_md_en: `📦 Last Mile Distribution Model Training

"Last mile delivery" is the most critical link in the supply chain and directly affects customer satisfaction.

In this programme you will learn the core principles of last-mile delivery, operational challenges and efficiency strategies. Cost analysis, SWOT assessment and a Trendyol Go case study bring theory into practice.

### Who is this for?

- Logistics and supply chain professionals
- E-commerce and retail operations managers
- Planners working on last-mile optimisation`,
    what_will_learn_en: `Fundamentals of the last-mile distribution model
Cost analysis and SWOT assessment
Real-world case study (Trendyol Go)
Operational efficiency strategies`,
    target_audience_en: `Logistics and supply chain specialists
E-commerce operations teams
Managers improving last-mile processes`,
  },
  {
    course_slug: "dijital-satinalma-yonetimi",
    subtitle:
      "Satın alma stratejileri, süreç akışı, KPI'lar ve dijital dönüşüm trendleri.",
    description_md: `Bu eğitimde satın alma stratejileri, süreç akışı, satın alma trendleri ve satın alma yönetiminde yaşanan gelişmeleri bulabilirsiniz.

Kurs boyunca satın alma organizasyonu, tedarikçi ilişkileri yönetimi, risk yönetimi, veri tabanlı karar verme ve yapay zekâ destekli e-ihale sistemleri gibi güncel konuları ele alacaksınız.

### Kimler için?

- Satın alma ve tedarik profesyonelleri
- Tedarik zinciri yöneticileri
- Dijital dönüşüm sürecindeki procurement ekipleri`,
    what_will_learn: `Satın alma stratejileri ve süreç adımları
KPI ve tedarikçi ilişkileri yönetimi
Risk yönetimi ve güncel trendler
Satın alma analitiği ve AI destekli e-ihale`,
    target_audience: `Satın alma ve procurement uzmanları
Tedarik zinciri yöneticileri
Dijital satın alma dönüşümüne liderlik edenler`,
    title_en: "Procurement Management",
    subtitle_en:
      "Procurement strategies, process flows, KPIs and digital transformation trends.",
    description_md_en: `In this programme you will explore procurement strategies, process flows, purchasing trends and developments shaping procurement management.

The course covers procurement organisation, supplier relationship management, risk management, data-driven decision making and AI-powered e-tendering systems.

### Who is this for?

- Procurement and purchasing professionals
- Supply chain managers
- Procurement teams undergoing digital transformation`,
    what_will_learn_en: `Procurement strategies and process steps
KPIs and supplier relationship management
Risk management and current trends
Procurement analytics and AI-powered e-tendering`,
    target_audience_en: `Procurement and purchasing specialists
Supply chain managers
Leaders driving digital procurement transformation`,
  },
  {
    course_slug: "tedarik-zinciri-yonetimi",
    subtitle:
      "Ürün fikrinden müşteriye — planlama, satın alma, üretim, dağıtım ve performans yönetimi.",
    description_md: `🔗 Tedarik Zinciri Yönetimi Eğitimi

Tedarik Zinciri Yönetimi, ürün veya hizmetin ilk fikir aşamasından nihai müşteriye ulaşana kadar olan tüm süreci kapsar. Bu eğitimde:

- TZY'nin temel kavramlarını
- Planlama, satın alma, üretim ve dağıtım süreçlerini
- Stok yönetimi, maliyet kontrolü ve dijital dönüşümün etkilerini

ayrıntılı şekilde öğreneceksiniz.`,
    what_will_learn: `Tedarik zinciri süreçlerine giriş
Satış ve üretim planlama
Satın alma ve depo yönetimi
Lojistik, müşteri ilişkileri ve performans yönetimi`,
    target_audience: `Tedarik zinciri ve operasyon profesyonelleri
Planlama ve lojistik ekipleri
TZY süreçlerini bütüncül görmek isteyen yöneticiler`,
    title_en: "Supply Chain Management",
    subtitle_en:
      "From product idea to customer — planning, procurement, production, distribution and performance.",
    description_md_en: `🔗 Supply Chain Management Training

Supply chain management covers the entire journey from initial product idea to the end customer. In this programme you will learn in detail:

- Core SCM concepts
- Planning, procurement, production and distribution processes
- Inventory management, cost control and the impact of digital transformation`,
    what_will_learn_en: `Introduction to supply chain processes
Sales and production planning
Procurement and warehouse management
Logistics, customer relations and performance management`,
    target_audience_en: `Supply chain and operations professionals
Planning and logistics teams
Managers seeking an end-to-end view of SCM`,
  },
  {
    course_slug: "ag-temelleri-egitimi",
    subtitle:
      "IP adresleme, subnetting, routing, switching ve temel ağ güvenliği — uygulamalı ağ eğitimi.",
    description_md: `Ağ Temelleri Eğitimi, ağ teknolojileri konusunda temel bilgileri edinmek ve bu alanda sağlam bir altyapı oluşturmak isteyenler için tasarlanmış kapsamlı bir kurstur.

Kurs boyunca IP adresleme, alt ağ oluşturma (subnetting), yönlendirme (routing) ve anahtarlama (switching) gibi ağın temel bileşenlerini detaylı öğreneceksiniz. Ağ güvenliği konuları ve laboratuvar çalışmaları ile teorik bilgiyi pratiğe dönüştüreceksiniz.

### Kimler için?

- BT alanında kariyer hedefleyenler
- Ağ yönetimi konusunda temel bilgi edinmek isteyenler
- Mevcut bilgi seviyesini artırmak isteyen IT profesyonelleri`,
    what_will_learn: `Ağ topolojileri ve temel bileşenler
IP adresleme, IPv4/IPv6 ve subnetting
Routing, switching ve ağ protokolleri
Temel ağ güvenliği ve pratik egzersizler`,
    target_audience: `BT kariyeri hedefleyenler
Ağ yönetimine yeni başlayanlar
Temel ağ bilgisini güçlendirmek isteyen IT uzmanları`,
    title_en: "Networking Fundamentals",
    subtitle_en:
      "IP addressing, subnetting, routing, switching and basic network security — hands-on training.",
    description_md_en: `Networking Fundamentals is a comprehensive course for anyone who wants core knowledge of network technologies and a solid foundation in the field.

You will learn IP addressing, subnetting, routing and switching in depth, along with network security topics and lab exercises that turn theory into practice.

### Who is this for?

- People targeting IT careers
- Beginners in network management
- IT professionals strengthening their fundamentals`,
    what_will_learn_en: `Network topologies and core components
IP addressing, IPv4/IPv6 and subnetting
Routing, switching and network protocols
Basic network security and practical exercises`,
    target_audience_en: `IT career starters
Beginners in network administration
IT specialists strengthening network fundamentals`,
  },
  {
    course_slug: "phyton",
    subtitle:
      "Yazılım dünyasına giriş ve Python temelleri — perakende verileriyle gerçek dünya analizi.",
    description_md: `Kursa Genel Bakış

Bu kurs, yazılım dünyasına sağlam ve anlaşılır bir giriş yapmak isteyenler için özel olarak tasarlanmıştır. Python programlama dilinin temellerini öğrenirken aynı zamanda perakende sektöründe gerçek dünya verileriyle analiz yapma yetkinliği kazanacaksınız.

### Kimler Katılmalı?

Kurs; yazılıma ilk adımını atmak isteyen, veri analitiğiyle ilgilenen, perakende sektöründe çalışan veya bu sektöre ilgi duyan herkes için uygundur. Teknik bir altyapınız olmasa bile öğrenmeye açık olmanız yeterli!

### Neler Öğreneceksiniz?

- Python dilinin temel yapısını
- Veri analizi ve görselleştirme araçlarını
- Gerçek proje örneği ile uçtan uca analiz`,
    what_will_learn: `Yazılım dünyasına giriş ve Python temelleri
Yazılım türleri ve geliştirme süreçleri
Python'ın özellikleri ve avantajları
Perakende verileriyle analiz becerisi`,
    target_audience: `Yazılıma yeni başlayanlar
Veri analitiğiyle ilgilenenler
Perakende sektöründe çalışan veya ilgi duyanlar`,
    title_en: "Python for Beginners",
    subtitle_en:
      "Introduction to software and Python basics — real-world analysis with retail data.",
    description_md_en: `Course Overview

This course is designed for anyone who wants a solid, accessible entry into the software world. You will learn Python fundamentals while gaining skills to analyse real-world retail data.

### Who Should Join?

The course suits anyone taking their first step into software, interested in data analytics, or working in—or curious about—the retail sector. No technical background required—just willingness to learn!

### What You Will Learn

- Core structure of the Python language
- Data analysis and visualisation tools
- End-to-end analysis with a real project example`,
    what_will_learn_en: `Introduction to software and Python basics
Types of software and development processes
Python features and advantages
Analysis skills with retail data`,
    target_audience_en: `Software beginners
Those interested in data analytics
Retail sector professionals and enthusiasts`,
  },
  {
    course_slug: "temel-ag-ve-siber-guvenlik",
    subtitle:
      "Ağ temellerinden siber güvenliğe — phishing, tehditler, güvenli internet ve kariyer yolu.",
    description_md: `Bu kurs, ağ ve siber güvenlik konularına ilgi duyan ve bu alanda kariyer yapmak isteyenler için mükemmel bir başlangıç noktasıdır.

Kurs boyunca ağ yapıları, veri iletimi, ağ protokolleri, güvenlik duvarları, VPN, şifreleme, phishing, sosyal mühendislik ve güvenli internet kullanımı gibi kritik konuları öğreneceksiniz. Pratik örnekler ve gerçek dünya senaryoları ile teorik bilgilerinizi pekiştireceksiniz.

### Kimler için?

- Siber güvenlik kariyeri hedefleyenler
- Teknik bilgisi olmayan ancak öğrenmeye istekli katılımcılar
- Dijital dünyada güvenliğini artırmak isteyen herkes`,
    what_will_learn: `Ağ temelleri, protokoller ve OSI/TCP-IP modelleri
Temel ağ güvenliği, firewall ve VPN
Phishing, sosyal mühendislik ve tehdit türleri
Güvenli internet kullanımı ve kariyer yolu (CCNA, Security+)`,
    target_audience: `Siber güvenlik kariyeri hedefleyenler
Ağ ve güvenlik konularına yeni başlayanlar
Kişisel ve kurumsal dijital güvenliği artırmak isteyenler`,
    title_en: "Network and Cybersecurity Fundamentals",
    subtitle_en:
      "From network basics to cybersecurity — phishing, threats, safe internet use and career path.",
    description_md_en: `This course is an excellent starting point for anyone interested in networking and cybersecurity who wants to build a career in the field.

You will learn network structures, data transmission, protocols, firewalls, VPNs, encryption, phishing, social engineering and safe internet use. Practical examples and real-world scenarios reinforce theoretical knowledge.

### Who is this for?

- People targeting a cybersecurity career
- Participants without technical background but eager to learn
- Anyone who wants to improve their digital security`,
    what_will_learn_en: `Network fundamentals, protocols and OSI/TCP-IP models
Basic network security, firewalls and VPN
Phishing, social engineering and threat types
Safe internet use and career path (CCNA, Security+)`,
    target_audience_en: `Cybersecurity career starters
Beginners in networking and security
Those improving personal and organisational digital security`,
  },
];
