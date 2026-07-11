/**
 * One-off generator for remaining paid category i18n files.
 * Run: node scripts/generate-remaining-paid-i18n.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const exportData = JSON.parse(
  readFileSync(resolve(root, "scripts/.remaining-paid-export.json"), "utf8"),
);

/** @type {Record<string, { sections?: Record<string,string>, lessons?: Record<string,string>, sections_tr?: Record<string,string>, lessons_tr?: Record<string,string> }>} */
const CURRICULUM_OVERRIDES = {
  "claude-ai-masterclass-from-zero-to-power-user": {
    sections_tr: {
      "SECTION 1: What is Claude?": "BÖLÜM 1: Claude Nedir?",
      "SECTION 2: Claude vs ChatGPT vs Gemini":
        "BÖLÜM 2: Claude vs ChatGPT vs Gemini",
      "SECTION 3: Claude's Superpowers": "BÖLÜM 3: Claude'ın Süper Güçleri",
      "SECTION 4: Prompt Techniques for Claude":
        "BÖLÜM 4: Claude için Prompt Teknikleri",
    },
    lessons_tr: {
      "Welcome & Course Overview": "Hoş Geldiniz ve Kurs Genel Bakışı",
      "Introduction to Section 1": "Bölüm 1'e Giriş",
      "Claude & Anthropic — The Safety-First AI Company":
        "Claude ve Anthropic — Güvenlik Odaklı Yapay Zekâ Şirketi",
      "The Claude Model Family: Opus · Sonnet · Haiku":
        "Claude Model Ailesi: Opus · Sonnet · Haiku",
      "Knowledge Check — Section 1": "Bilgi Kontrolü — Bölüm 1",
      "Introduction to Section 2": "Bölüm 2'ye Giriş",
      "Side-by-Side Comparison: Claude · ChatGPT · Gemini":
        "Yan Yana Karşılaştırma: Claude · ChatGPT · Gemini",
      "Decision Guide: Which AI for Which Task?":
        "Karar Rehberi: Hangi Görev İçin Hangi Yapay Zekâ?",
      "Knowledge Check — Section 2": "Bilgi Kontrolü — Bölüm 2",
      "Introduction to Section 3": "Bölüm 3'e Giriş",
      "6 Things Claude Does Better Than Any Other AI":
        "Claude'ın Diğer Tüm Yapay Zekâlardan Daha İyi Yaptığı 6 Şey",
      "Claude in Action — 3 Real-World Examples":
        "Claude Uygulamada — 3 Gerçek Dünya Örneği",
      "Knowledge Check — Section 3": "Bilgi Kontrolü — Bölüm 3",
      "Introduction to Section 4": "Bölüm 4'e Giriş",
    },
  },
  "new-course-8": {
    sections: {
      "Sıfırdan LLM Geliştirme (Part1: Ders 0 / Ders 10)":
        "LLM Development from Scratch (Part 1: Lessons 0–10)",
    },
    lessons: {
      "Ders 0: Sıfırdan LLM Geliştirme Tanıtım Videosu":
        "Lesson 0: LLM Development from Scratch — Introduction",
      "Ders 1: LLM ile İlgili Temel Terminoloji, Önemli Makaleler ve Siteler":
        "Lesson 1: Core LLM Terminology, Key Papers and Resources",
      "Ders 2: LLM Geliştirme için Gerekli Kurulum ve Araçlar":
        "Lesson 2: Setup and Tools for LLM Development",
      "Ders 3: Sıfırdan Python ile Tokenizer Kodlama":
        "Lesson 3: Building a Tokenizer from Scratch in Python",
      "Ders 4: Açık Kaynak Tokenizer'ları Kullanma":
        "Lesson 4: Using Open-Source Tokenizers",
      "Ders 5: Sıfırdan Subword Tokenizer Kodlama":
        "Lesson 5: Building a Subword Tokenizer from Scratch",
      "Ders 6: SentencePiece ile BPE Tokenizer Oluşturma ve Hugging Face'e Yükleme":
        "Lesson 6: Building a BPE Tokenizer with SentencePiece and Uploading to Hugging Face",
      "Ders 7: Context Length ve Veri Seti Hazırlama":
        "Lesson 7: Context Length and Dataset Preparation",
      "Ders 8: PyTorch ile DataLoader Oluşturma":
        "Lesson 8: Creating a DataLoader with PyTorch",
      "Ders 9: Embedding Katmanları ve Anlam Temsili":
        "Lesson 9: Embedding Layers and Semantic Representation",
      "Ders 10: Sözlük ile Embedding Arasındaki Bağ":
        "Lesson 10: The Link Between Vocabulary and Embeddings",
    },
  },
  "sifirdan-llm-gelistirme-part1-ders-11-ders-20": {
    sections: {
      "Sıfırdan LLM Geliştirme (Part1: Ders 11 / Ders 20)":
        "LLM Development from Scratch (Part 2: Lessons 11–20)",
    },
    lessons: {
      "Ders 11: Basit Positional Embedding Uygulaması":
        "Lesson 11: Simple Positional Embedding Implementation",
      "Ders 12: Sinusoidal Positional Encoding Uygulaması":
        "Lesson 12: Sinusoidal Positional Encoding Implementation",
      "Ders 13: Rotary Position Encoding (RoPE) Uygulaması":
        "Lesson 13: Rotary Position Encoding (RoPE) Implementation",
      "Ders 14: Modelin Temelini Oluşturmak":
        "Lesson 14: Building the Foundation of the Model",
      "Ders 15: Basit Self-Attention ile Bağlamı Anlamak":
        "Lesson 15: Understanding Context with Simple Self-Attention",
      "Ders 16: Manhattan Mesafesiyle Anlamsal Yakınlığı Hesaplamak":
        "Lesson 16: Computing Semantic Similarity with Manhattan Distance",
      "Ders 17: Kosinüs Benzerliğiyle Anlamsal Yakınlığı Hesaplamak":
        "Lesson 17: Computing Semantic Similarity with Cosine Similarity",
      "Ders 18: Attention Skoru Hesaplamak: QKV ve Softmax":
        "Lesson 18: Computing Attention Scores: QKV and Softmax",
      "Ders 19: Sıfırdan Self-Attention Katmanı Kodlama":
        "Lesson 19: Coding a Self-Attention Layer from Scratch",
      "Ders 20: Causal Self-Attention ve Dropout Uygulaması":
        "Lesson 20: Causal Self-Attention and Dropout Implementation",
    },
  },
  "sifirdan-llm-gelistirme-part-3-ders-21-ders30": {
    sections: {
      "Sıfırdan LLM Geliştirme (Part 3: Ders 21 / Ders30)":
        "LLM Development from Scratch (Part 3: Lessons 21–30)",
    },
    lessons: {
      "Ders 21: Masking, Truncation ve Yapısal Hataları Önlemek":
        "Lesson 21: Masking, Truncation and Preventing Structural Errors",
      "Ders 22: PyTorch ile Multi-Head Attention Kodlama":
        "Lesson 22: Coding Multi-Head Attention with PyTorch",
      "Ders 23: Layer Normalization Mantığı ve PyTorch ile Uygulaması":
        "Lesson 23: Layer Normalization Logic and PyTorch Implementation",
      "Ders 24: Transformer'da Multi-Layer Perceptron (MLP) ve GeLU Aktivasyonu":
        "Lesson 24: MLP and GeLU Activation in the Transformer",
      "Ders 25: MLP ve Residual Bağlantılarla Decoder Bloğu Kurma":
        "Lesson 25: Building a Decoder Block with MLP and Residual Connections",
      "Ders 26: LM Head ile Kelime Tahmini Yapmak":
        "Lesson 26: Word Prediction with the LM Head",
      "Ders 27: Logits ve Loss Fonksiyonunu Anlamak":
        "Lesson 27: Understanding Logits and the Loss Function",
      "Ders 28: Loss, Optimizer ve Backpropagation'u Anlamak":
        "Lesson 28: Understanding Loss, Optimizer and Backpropagation",
      "Ders 29: Dataset, Tokenizer ve Eğitim Döngüsü Kurmak":
        "Lesson 29: Setting Up Dataset, Tokenizer and Training Loop",
      "Ders 30: PyTorch ile Model Kaydetme ve Yükleme (torch.save & load_state_dict)":
        "Lesson 30: Saving and Loading Models with PyTorch (torch.save & load_state_dict)",
    },
  },
  "sifirdan-llm-gelistirme-part-4-ders-31-ders40": {
    sections: {
      "Sıfırdan LLM Geliştirme (Part 4: Ders 31 / Ders40)":
        "LLM Development from Scratch (Part 4: Lessons 31–41)",
    },
    lessons: {
      "Ders 31: Notebook'u Birleştirip Yayına Hazırlamak":
        "Lesson 31: Merging the Notebook and Preparing for Release",
      "Ders 32: LLM için Generate Fonksiyonu Yazmak":
        "Lesson 32: Writing a Generate Function for the LLM",
      "Ders 33: Gradio ile Chatbot Arayüzü Geliştirmek-1":
        "Lesson 33: Building a Chatbot UI with Gradio — Part 1",
      "Ders 34: Gradio ile Chatbot Arayüzü Geliştirmek-2":
        "Lesson 34: Building a Chatbot UI with Gradio — Part 2",
      "Ders 35: CPU'dan GPU'ya Geçiş ve Batch Processing":
        "Lesson 35: Moving from CPU to GPU and Batch Processing",
      "Ders 36: Batch Processing ve Padding":
        "Lesson 36: Batch Processing and Padding",
      "Ders 37: Batch Processing ve MPS ile Hızlandırmak":
        "Lesson 37: Batch Processing and Acceleration with MPS",
      "Ders 38: Temperature, Top-P ve Top-K Nedir?":
        "Lesson 38: What Are Temperature, Top-P and Top-K?",
      "Ders 39: Temperature, Top-P ve Top-K Kodlama":
        "Lesson 39: Coding Temperature, Top-P and Top-K",
      "Ders 40: Top-P (Nucleus) Sampling Nedir?":
        "Lesson 40: What Is Top-P (Nucleus) Sampling?",
      "Ders 41: Arayüzü Geliştirip Parametre Kontrolü Eklemek":
        "Lesson 41: Enhancing the UI and Adding Parameter Controls",
    },
  },
  "last-mile": {
    sections: { "Last Mile": "Last Mile" },
    lessons: {
      "Last Mile Dağıtım Modeli": "Last Mile Distribution Model",
      "Last Mile Dağıtım Model Maliyet Analizi":
        "Last Mile Distribution Model Cost Analysis",
      "Last Mile Dağıtım Model SWOT Analizi":
        "Last Mile Distribution Model SWOT Analysis",
      "Last Mile Dağıtım Trendyol Go Örnek Proje":
        "Last Mile Distribution — Trendyol Go Case Study",
    },
  },
  "dijital-satinalma-yonetimi": {
    sections: {
      "Dijital Satınalma Yönetimi": "Digital Procurement Management",
    },
    lessons: {
      "Satın Alma Yönetimi Nedir?": "What Is Procurement Management?",
      "Satın Alma Yönetimin Amaçları": "Objectives of Procurement Management",
      "Satın Alma Yönetimi Yapısı & Organizasyonu":
        "Procurement Management Structure and Organisation",
      "Satın Alma Stratejileri": "Procurement Strategies",
      "Satın Alma Süreç Adımları": "Procurement Process Steps",
      "Satın Almada Stratejik Araçlar ve Yaklaşımlar":
        "Strategic Tools and Approaches in Procurement",
      "KPI (Performans Göstergeleri)": "KPIs (Key Performance Indicators)",
      "Tedarikçi İlişkileri Yönetimi": "Supplier Relationship Management",
      "Risk Yönetimi": "Risk Management",
      "Güncel Trendler": "Current Trends",
      "Satın Alma Analitiği - Veri Tabanlı Karar Verme":
        "Procurement Analytics — Data-Driven Decision Making",
      "Tedarikçi İşbirlikleri": "Supplier Collaboration",
      "Çevik Satın Alma": "Agile Procurement",
      "Servis Olarak Tedarik": "Supply as a Service",
      "Yapay Zeka Destekli E-İhale ve Pazarlık Sistemleri":
        "AI-Powered E-Tendering and Negotiation Systems",
    },
  },
  "tedarik-zinciri-yonetimi": {
    sections: {
      "Tedarik Zinciri Yönetimi": "Supply Chain Management",
    },
    lessons: {
      "Tedarik Zinciri Süreçlerine Giriş":
        "Introduction to Supply Chain Processes",
      "Tedarik Zinciri Süreçleri Satış Üretim Planlama":
        "Supply Chain Processes — Sales and Production Planning",
      "Satınalma Depo Yönetimi": "Procurement and Warehouse Management",
      "Lojistik, Müşteri İlişkileri ve Performans Yönetimi":
        "Logistics, Customer Relations and Performance Management",
    },
  },
  "ag-temelleri-egitimi": {
    sections: {
      "Kurs içeriği ve kurs tanıtımı": "Course Content and Introduction",
      "Ağ Nedir ?": "What Is a Network?",
      "Ağların Temel Bileşenleri": "Core Components of Networks",
      "Ağların Çalışma Prensibi": "How Networks Work",
      "Ağların türleri": "Types of Networks",
      "IP Adresi Nedir ? Çeşitleri Nelerdir ?":
        "What Is an IP Address? What Are the Types?",
      "Ip Adreslerinin İşlevleri": "Functions of IP Addresses",
      "Ip Adreslerinin Türleri": "Types of IP Addresses",
      "Ip Adreslerinin Önemi": "Importance of IP Addresses",
      "Ip Adresleme": "IP Addressing",
      "Subnetting ( Ağ Oluşturma )": "Subnetting (Network Segmentation)",
      "Temel Ağ Cihazları": "Basic Network Devices",
      "Ağ Protokolleri": "Network Protocols",
      "Temel Ağ Güvenliği": "Basic Network Security",
      "Pratik Ve Egzersizler": "Practical Exercises",
      Sınav: "Exam",
    },
    lessons: {
      "Ağ Temelleri Eğitimi Giriş": "Networking Fundamentals — Introduction",
      "Ağ Nedir ?": "What Is a Network?",
      "Ağların Temel Bileşenleri": "Core Components of Networks",
      "Ağların Çalışma Prensibi": "How Networks Work",
      "Ağların türleri": "Types of Networks",
      "Ip Adresi Nedir ?": "What Is an IP Address?",
      "IPv4 Adresi": "IPv4 Address",
      "IPv6 Adresi": "IPv6 Address",
      "Ip Adreslerinin İşlevleri": "Functions of IP Addresses",
      "Cihaz Tanımlama": "Device Identification",
      "Veri Yönlendirme": "Data Routing",
      "Ağ Segmentasyonunu Sağlama": "Enabling Network Segmentation",
      "Ip Adreslerinin Türleri": "Types of IP Addresses",
      "Statik IP Adresi": "Static IP Address",
      "Dinamik IP Adresi": "Dynamic IP Address",
      "Özel ( Private ) ve Genel ( Public ) IP adresi":
        "Private and Public IP Addresses",
      "Ip Adreslerinin Önemi": "Importance of IP Addresses",
      "Ip Adresleme": "IP Addressing",
      "Subnetting ( Ağ Oluşturma )": "Subnetting (Network Segmentation)",
      "Subnetting Nedir ?": "What Is Subnetting?",
      "Subnet Maskesi Nedir ?": "What Is a Subnet Mask?",
      "CIDR Notasyonu": "CIDR Notation",
      "CIDR Notasyonun Avantajları": "Advantages of CIDR Notation",
      "CIDR Notasyonun Hesaplanması": "Calculating CIDR Notation",
      "Temel Ağ Cihazları": "Basic Network Devices",
      "Ağ Protokolleri": "Network Protocols",
      "Temel Ağ Güvenliği": "Basic Network Security",
      "Pratik Ve Egzersizler": "Practical Exercises",
    },
  },
  "phyton": {
    sections: {
      "Yazılım Dünyasına Giriş": "Introduction to the Software World",
      "Phyton Dünyasına Giriş": "Introduction to Python",
    },
    lessons: {
      "Yazılım Dünyasına Giriş ve Python'a Kısa Bakış":
        "Introduction to Software and a Quick Look at Python",
      "Yazılım Nedir, Günlük Hayattaki Yeri":
        "What Is Software and Its Role in Daily Life",
      "Yazılım Türleri ve Geliştirme Süreçleri":
        "Types of Software and Development Processes",
      "Yazılım Dillerinin Evrimi": "Evolution of Programming Languages",
      "Phyton'a Kısa Bakış": "A Quick Look at Python",
      "Phyton : Özellikleri ve Avantajları":
        "Python: Features and Advantages",
      "Diğer Bölümler": "Other Sections",
    },
  },
  "temel-ag-ve-siber-guvenlik": {
    sections: {
      "Eğitim Giriş Ve Bilgilendirme": "Course Introduction and Overview",
      "Ağ Temelleri": "Network Fundamentals",
      "Ağ Protokolleri ve Modelleri": "Network Protocols and Models",
      "Temel Ağ Güvenliği": "Basic Network Security",
      "Oltalama (Phishing) ve Sosyal Mühendislik":
        "Phishing and Social Engineering",
      "Güvenlik Tehditleri ve Saldırılar": "Security Threats and Attacks",
      "Güvenli İnternet Kullanımı": "Safe Internet Use",
      "Temel Ağ İzleme ve Yönetimi": "Basic Network Monitoring and Management",
      "Sertifikalar ve Kariyer Yolu": "Certifications and Career Path",
    },
    lessons: {
      "Eğitim Giriş Ve Bilgilendirme": "Course Introduction and Overview",
      "Ağ Temelleri Ve Ağ Nedir ?": "Network Fundamentals — What Is a Network?",
      "Temel Ağ Bileşenleri": "Core Network Components",
      "IP Adresleme ve Alt Ağlar": "IP Addressing and Subnets",
      "LAN ve WAN Kavramları": "LAN and WAN Concepts",
      "Router ve Switch Nedir?": "What Are Routers and Switches?",
      "Ağ Güvenliği": "Network Security",
      "Ağ Performansı": "Network Performance",
      "Ağ Yönetimi": "Network Management",
      "OSI modeli ve Katmanları": "The OSI Model and Its Layers",
      "TCP_IP Protokol Ailesi": "The TCP/IP Protocol Suite",
      "HTTP, HTTPS, FTP, SMTP Protokolleri":
        "HTTP, HTTPS, FTP and SMTP Protocols",
      "DNS ve DHCP Kavramları": "DNS and DHCP Concepts",
      "Kablosuz Ağ Teknolojileri": "Wireless Network Technologies",
      "Ağ Performansı Ve Optimizasyon": "Network Performance and Optimisation",
      "Güvenlik Duvarları (Firewall)": "Firewalls",
      "VPN Nedir ve Nasıl Çalışır": "What Is a VPN and How Does It Work?",
      "Antivirüs ve Antimalware Yazılımları":
        "Antivirus and Anti-Malware Software",
      "Güvenli Parola Oluşturma": "Creating Secure Passwords",
      "Ağ Trafiği İzleme Ve Analizi": "Network Traffic Monitoring and Analysis",
      "Güvenlik Açıklarının Tespiti ve Yönetimi":
        "Detecting and Managing Security Vulnerabilities",
      "Şifreleme Teknolojileri": "Encryption Technologies",
      "Kullanıcı Erişim Kontrolü": "User Access Control",
      "Felaket Kurtarma ve Yedekleme Planları":
        "Disaster Recovery and Backup Plans",
      "Sosyal Mühendislik Nedir": "What Is Social Engineering?",
      "Oltalama Nedir": "What Is Phishing?",
      "Oltalama maili alırsam ne yapmalıyım":
        "What Should I Do If I Receive a Phishing Email?",
      "Sosyal Medyada Bilgi Paylaşımı": "Sharing Information on Social Media",
      "Spam Mail Nedir": "What Is Spam Email?",
      "Spam Mail Alırsam Ne Yapmalıyım": "What Should I Do If I Receive Spam?",
      "Güvenli Ağ Kullanımı": "Secure Network Use",
      "Kişisel Güvenlik İpuçları": "Personal Security Tips",
      "Şüpheli Durumlarda Yapılması Gerekenler":
        "What to Do in Suspicious Situations",
      "Güvenli Bilgi Yönetimi": "Secure Information Management",
      "Virüsler, Solucanlar ve Truva Atları":
        "Viruses, Worms and Trojan Horses",
      "Dos ve DDoS Saldırıları": "DoS and DDoS Attacks",
      "Ransomware ve Fidye Yazılımları": "Ransomware",
      "Veritabanı Güvenliği ve SQL Enjeksiyonları":
        "Database Security and SQL Injection",
      "Güvenli Web Tarayıcı Ayarları": "Secure Web Browser Settings",
      "Şifreleme ve SSL/TLS Sertifikaları":
        "Encryption and SSL/TLS Certificates",
      "Güvenli E-Posta Kullanımı": "Secure Email Use",
      "Sosyal Medya Güvenliği": "Social Media Security",
      "Kötü Amaçlı Yazılımlardan Korunma": "Protection Against Malware",
      "Çevrimiçi Gizlilik ve Veri Koruması":
        "Online Privacy and Data Protection",
      "Çocukların Güvenli İnternet Kullanımı":
        "Safe Internet Use for Children",
      "Güvenli İnternet Kullanımı İçin İpuçları":
        "Tips for Safe Internet Use",
      "Temel Ağ İzleme Araçları": "Basic Network Monitoring Tools",
      "Temel Ağ Performans İzleme": "Basic Network Performance Monitoring",
      "Temel Ağ Güvenlik İzleme": "Basic Network Security Monitoring",
      "Temel Ağ Sorun Giderme Teknikleri":
        "Basic Network Troubleshooting Techniques",
      "Temel Ağ Yapılandırma Yönetimi": "Basic Network Configuration Management",
      "Temel Log Yönetimi ve İzleme": "Basic Log Management and Monitoring",
      "Temel Raporlama ve Görselleştirme":
        "Basic Reporting and Visualisation",
      "Temel Otomatik Uyarı ve Bildirim Sistemleri":
        "Basic Automated Alert and Notification Systems",
      "Sonuç Ve Öneriler": "Conclusion and Recommendations",
      "CCNA ve CompTIA Security+ gibi Sertifikalar":
        "Certifications Such as CCNA and CompTIA Security+",
      "Siber Güvenlik Kariyerinde İlk Adımlar":
        "First Steps in a Cybersecurity Career",
      "Meslek Ahlakı ve Gizlilik": "Professional Ethics and Privacy",
    },
  },
};

function normalizeApostrophe(s) {
  return s.replace(/\u2019/g, "'").replace(/'/g, "'");
}

function findMapKey(map, title) {
  if (map[title]) return title;
  const norm = normalizeApostrophe(title);
  for (const key of Object.keys(map)) {
    if (normalizeApostrophe(key) === norm) return key;
  }
  return null;
}

function formatRecord(map) {
  const entries = Object.entries(map);
  if (entries.length === 0) return "{}";
  const lines = entries.map(([k, v]) => `      ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  return `{\n${lines.join("\n")}\n    }`;
}

function buildCurriculumEntry(course) {
  const slug = course.course_slug;
  const override = CURRICULUM_OVERRIDES[slug];
  if (!override) throw new Error(`Missing curriculum override for ${slug}`);

  const sections = override.sections ?? {};
  const lessons = override.lessons ?? {};
  const sectionsTr = override.sections_tr;
  const lessonsTr = override.lessons_tr;

  for (const section of course.sections) {
    const title = section.title.trim();
    if (sectionsTr) {
      const key = findMapKey(sectionsTr, title);
      if (!key) throw new Error(`[${slug}] missing sections_tr: ${JSON.stringify(title)}`);
    } else {
      const key = findMapKey(sections, title);
      if (!key) throw new Error(`[${slug}] missing sections map: ${JSON.stringify(title)}`);
    }
  }

  for (const lesson of course.lessons) {
    const title = lesson.title.trim();
    if (lessonsTr) {
      const key = findMapKey(lessonsTr, title);
      if (!key) throw new Error(`[${slug}] missing lessons_tr: ${JSON.stringify(title)}`);
    } else {
      const key = findMapKey(lessons, title);
      if (!key) throw new Error(`[${slug}] missing lessons map: ${JSON.stringify(title)}`);
    }
  }

  let body = `  {\n    course_slug: ${JSON.stringify(slug)},\n    sections: ${formatRecord(sections)},\n    lessons: ${formatRecord(lessons)},`;
  if (sectionsTr) body += `\n    sections_tr: ${formatRecord(sectionsTr)},`;
  if (lessonsTr) body += `\n    lessons_tr: ${formatRecord(lessonsTr)},`;
  body += `\n  }`;
  return body;
}

const curriculumEntries = exportData.map(buildCurriculumEntry);

const curriculumTs = `import type { PlanlamaCurriculumI18n } from "@/lib/course/planlama-curriculum-content";

/** Yapay Zeka + Tedarik Zinciri + Bilgi Teknolojileri — 11 ücretli kurs müfredatı TR/EN */
export const REMAINING_PAID_CURRICULUM_I18N: PlanlamaCurriculumI18n[] = [
${curriculumEntries.join(",\n")},
];
`;

writeFileSync(
  resolve(root, "lib/course/remaining-paid-curriculum-content.ts"),
  curriculumTs,
  "utf8",
);

let sectionCount = 0;
let lessonCount = 0;
for (const course of exportData) {
  sectionCount += course.sections.length;
  lessonCount += course.lessons.length;
}

console.log(`Wrote curriculum: ${exportData.length} courses, ${sectionCount} sections, ${lessonCount} lessons`);
