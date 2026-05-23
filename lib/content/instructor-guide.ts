export interface GuideTable {
  headers: string[];
  rows: string[][];
}

export type GuideBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string; id?: string }
  | { type: "h4"; text: string; id?: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "callout"; text: string; label?: string }
  | { type: "highlight"; text: string }
  | { type: "table"; table: GuideTable };

export interface GuideSubsection {
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export interface GuideChapter {
  id: string;
  number: number;
  title: string;
  summary: string;
  subsections: GuideSubsection[];
}

export const instructorGuideChapters: GuideChapter[] = [
  {
    id: "konu-icerik-seo",
    number: 1,
    title:
      "Kursunuzun Konusunu, İçeriğini Belirleme, SEO Stratejisini Netleştirme",
    summary: "Konu seçimi, içerik planı ve SEO",
    subsections: [
      {
        id: "konu-belirleme",
        title: "1. Kursunuzun Konusunu Belirleme",
        blocks: [
          {
            type: "p",
            text: "Doğru konu seçimi, kursunuzun satış potansiyelini, öğrenci ilgisini ve rekabet gücünü doğrudan etkiler. Bu nedenle konu seçimini tesadüfe değil, veriye ve stratejiye dayandırmalısınız. Aşağıdaki 3 soruya yanıt vererek başlayın:",
          },
          {
            type: "ol",
            items: [
              "Ben hangi konuda yetkinim / deneyimliyim?",
              "Bu konuyu anlatmaktan keyif alıyor muyum?",
              "Bu konu akademi veya dış dünyada talep görüyor mu?",
            ],
          },
          {
            type: "highlight",
            text: "🎯 Kesişim Noktası = Kurs Konusu (İlgin var + Anlatabiliyorsun + Talep var)",
          },
          { type: "p", text: "Nitelikli kurs konusu belirlemek için;" },
          { type: "ul", items: ["Kendi Uzmanlık Alanını Listele"] },
          {
            type: "ul",
            items: [
              "Hangi konularda iş deneyimin var?",
              "Daha önce ne anlattın / öğrettin?",
              "Sık sorulan sorular neler?",
            ],
          },
          {
            type: "callout",
            label: "📌 Örnek:",
            text: "Excel kullanımı • Python ile otomasyon • Shopify mağaza kurma • Zihin haritalama teknikleri • Pazar Araştırması Yap (Talep Var mı?)",
          },
          { type: "h4", text: "📊 Yöntem 1: Anahtar Kelime Araması" },
          {
            type: "ul",
            items: [
              "Akademiye ya da global eğitim sitelerine gir, arama kutusuna konunu yaz.",
              "İlk 5 kursa bak:",
            ],
          },
          {
            type: "ul",
            items: [
              "Kaç öğrenci var?",
              "Son güncelleme ne zaman?",
              "Ortalama puan ne?",
            ],
          },
          {
            type: "callout",
            label: "📌 Örnek:",
            text: "“Excel Dashboard” yaz → En üstteki kursun 4.000 öğrencisi varsa ve güncelse → talep var.",
          },
          { type: "h4", text: "🌍 Yöntem 2: Google Trends + Reddit/Quora" },
          {
            type: "ul",
            items: [
              "Google Trends’te “Excel Dashboard” terimini arat.",
              "Reddit veya Quora’da o konuyla ilgili ne kadar soru soruluyor?",
            ],
          },
          {
            type: "p",
            text: "İpucu: Orta rekabetli, ama öğrencilerin eksik yorum yaptığı (örneğin: “Uygulama yoktu”, “Ses kalitesi kötüydü”) kurslar olan alanı seçin. Kaliteyle fark yaratabilirsiniz.",
          },
          {
            type: "table",
            table: {
              headers: [
                "Kriter",
                "Düşük Rekabet",
                "Orta",
                "Yüksek Rekabet",
              ],
              rows: [
                ["Kurs sayısı", "5-10", "10-50", "50+"],
                ["Ortalama puan", "< 4.2", "4.2 – 4.5", "4.6+"],
                ["Fiyat çeşitliliği", "Az", "Orta", "Çok"],
              ],
            },
          },
        ],
      },
      {
        id: "kurs-icerigi",
        title: "KURS İÇERİĞİNİ TANIMLA",
        blocks: [
          {
            type: "ul",
            items: [
              "Ana konuları modül olarak ayır: Giriş, Temeller, İleri Teknikler, Uygulamalar, Projeler, Bonus.",
            ],
          },
          {
            type: "ul",
            items: [
              "Her bölüm için ideal uzunluk: 3–7 dakikalık kısa videolar → kullanıcı dikkatini korur. Kursun toplamı yarım saatin altında olmamalı, 3 saati mümkünse geçmemelidir.",
            ],
          },
          {
            type: "ul",
            items: [
              "Her bölüm sonunda: Özet / pratik yap / mini quiz / kaynak PDF / Github linki.",
            ],
          },
          {
            type: "ul",
            items: [
              "İçeriği önce kağıda/Notion’a dök → sonra çekim yap.",
            ],
          },
          {
            type: "h4",
            text: "🧰 Teknik Ekipman Rehberi (Low Budget – High Quality)",
          },
          {
            type: "table",
            table: {
              headers: ["Kategori", "Öneri"],
              rows: [
                ["Mikrofon", "Boya BY-M1, Samson Q2U, Rode NT-USB Mini"],
                ["Kamera", "Logitech C920 / iPhone 12+ / DSLR"],
                ["Işık", "Softbox seti ya da ring light (Neewer / Godox)"],
                ["Ekran Kaydı", "OBS Studio + StreamDeck (isteğe bağlı)"],
                [
                  "Video Editör",
                  "CapCut, DaVinci Resolve, Camtasia, Final Cut Pro",
                ],
              ],
            },
          },
          { type: "h4", text: "🧑‍💻 Çekim Teknikleri" },
          {
            type: "ul",
            items: [
              "Ekran paylaşımı + yüz kombinasyonu (picture-in-picture)",
              "Arka plan sade (evdeyse → minimal bir köşe)",
              "Girişte gülümse, dik dur, göz teması kur",
            ],
          },
          { type: "h4", text: "🎞️ Düzenleme İpuçları" },
          {
            type: "ul",
            items: [
              "Başta 3 saniyelik jenerik",
              "Altyazı ekle (otomatik YouTube → SRT dönüştür)",
              "Anahtar kelimeleri bold fontla öne çıkar (görselde)",
              "Her bölüm sonunda hızlı tekrar ve yönlendirme",
            ],
          },
        ],
      },
      {
        id: "seo-stratejisi",
        title: "SEO STRATEJİSİ BELİRLEME",
        blocks: [
          { type: "h4", text: "🔑 Başlık ve Alt Başlık" },
          {
            type: "ul",
            items: [
              "Başlıkta mutlaka: [Konu] + [Seviye] + [Kazanım]",
              "Örn: Python ile Sıfırdan Uygulamalı Otomasyon | Başlangıç – İleri",
            ],
          },
          {
            type: "ul",
            items: [
              "Alt başlık: SEO anahtar kelimeleri içermeli",
              "Örn: Web scraping, otomasyon, Excel API entegrasyonu ve çok daha fazlası.",
            ],
          },
          { type: "h4", text: "✍️ Açıklama Bölümü" },
          {
            type: "ul",
            items: [
              "Bölüm 1: Neyi, nasıl, neden öğretiyorsun?",
              "Bölüm 2: Kurs sonunda ne beceriye sahip olacaklar?",
              "Bölüm 3: Kime uygun – kimlere uygun değil?",
              "Bölüm 4: Bonuslar – canlı destek, kaynaklar, Discord kanalı varsa belirt.",
            ],
          },
          {
            type: "p",
            text: "SEO Anahtar Kelimeler: 2-3 cümlede bir doğal olarak geçmeli (Google + Thorius Akademi araması için)",
          },
          {
            type: "ul",
            items: [
              "Başlık: Kısa, güçlü, aranabilir – örn. Excel ile Finansal Analiz | Sıfırdan Uzmana",
              "Alt Başlık: Öğreneceklerini kısa anlat (max. 120 karakter).",
              "Açıklama: Arama motorları için anahtar kelime yoğun yaz:",
            ],
          },
          {
            type: "ul",
            items: [
              "Ne öğrenecekler?",
              "Kimler için?",
              "İçerik detayları?",
              "Gerekli ön bilgi?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "hedef-kitle",
    number: 2,
    title: "Hedef Kitleni Tanımla",
    summary: "Persona ve öğrenci ihtiyaçları",
    subsections: [
      {
        id: "hedef-kitle-tanim",
        title: "2. Hedef Kitleni Tanımla",
        blocks: [
          {
            type: "p",
            text: "Aşağıdaki soruları eğitim hazırlamadan önce aklınızdaki konuyu da dikkate alarak yanıtlamaya çalışın.",
          },
          {
            type: "ul",
            items: [
              "Kimler bu eğitimi almalı?",
              "Öncelikle eğitimin içeriği ve hedefi Başlangıç seviyesi mi, orta mı, ileri mi?",
              "Öğrencilerin teknik altyapısı ne seviyede?",
            ],
          },
          {
            type: "ul",
            items: [
              "Eğitimin sonunda ne öğrenmiş olacaklar?",
              "Ölçülebilir hedefler koy: Örn. “Excel’de Pivot Table yapabilecek”, “React ile Todo App yazabilecek”.",
            ],
          },
          {
            type: "ul",
            items: [
              "Sorunları nedir, neden bu kursa ihtiyaç duyarlar?",
              "Gelmesini planladığımız öğrencilerin ihtiyacı tam olarak ne ve bu eğitim onlara ne katacak. Zaman, bilgi, motivasyon, kaynak eksikliği mi?",
            ],
          },
          {
            type: "p",
            text: "Aşağıdaki gibi 👉 En az 2 farklı persona yaz ve içeriği onların acı noktalarına göre kurgula.",
          },
          {
            type: "table",
            table: {
              headers: ["Özellik", "Örnek"],
              rows: [
                ["Yaş", "22–35"],
                ["Meslek", "Öğrenci, Junior çalışan, girişimci"],
                ["Eğitim", "Üniversite mezunu / mezun adayı"],
                [
                  "Teknik bilgi",
                  "Orta düzey Excel, temel düzey dijital pazarlama",
                ],
                ["Hedefi", "Yeni bir iş bulmak, maaş artırmak"],
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "sunum-uygulama",
    number: 3,
    title:
      "Etkili Sunum Teknikleri, Uygulama ve Projelerle Güçlendirme",
    summary: "Sunum, video akışı ve projeler",
    subsections: [
      {
        id: "sunum-teknikleri",
        title: "3. Etkili Sunum Teknikleri",
        blocks: [
          {
            type: "ul",
            items: [
              "Hitabet çalış: Anlaşılır, özgüvenli, enerji dolu.",
              "Örnekle anlat: Gerçek dünya uygulamaları → “İşte bu yüzden öğreniyoruz.”",
              "Yavaşla – duraksamalar ekle: Bilginin oturması için zaman tanı.",
              "Görsel anlatım: Dönem dönem ekran, slayt, yazı, çizim kullan.",
              "Ek açıklamalar: Ekranda anlatırken, alt açıklama, not, ok vb. grafiklerle zenginleştir.",
            ],
          },
          { type: "p", text: "Deneme videosu çekebilirsin." },
          { type: "h4", text: "🎬 Video Akışı (Max. 2 dk)" },
          {
            type: "ol",
            items: [
              "Kim olduğun (15 sn) — “Merhaba, ben X. 6 yıldır veri analiziyle ilgileniyorum ve şu ana kadar 50+ projeye imza attım…”",
              "Kursun ne sunduğu (30 sn) — “Bu kursta veri analizi için Python’ı baştan sona öğrenecek, 3 gerçek proje yapacağız.”",
              "Kazanım (20 sn) — “Bu kurs sonunda kendi otomasyon botunu yazabileceksin ve freelance iş almaya başlayabilirsin.”",
              "Neden sen? (15 sn) — “X şirketlerinde çalıştım, 500+ kişiye eğitim verdim.”",
              "Harekete geçirici kapanış (10 sn) — “Haydi başlayalım – seni içeride bekliyorum!”",
            ],
          },
          {
            type: "p",
            text: "Başlıkta mutlaka: [Konu] + [Seviye] + [Kazanım]: Örn: Python ile Sıfırdan Uygulamalı Otomasyon | Başlangıç – İleri",
          },
          {
            type: "p",
            text: "Alt başlık: SEO anahtar kelimeleri içermeli, Örn: Web scraping, otomasyon, Excel API entegrasyonu ve çok daha fazlası.",
          },
        ],
      },
      {
        id: "uygulama-projeler",
        title: "Uygulama ve Projeler ile Güçlendirme",
        blocks: [
          { type: "h4", text: "🧠 Öğrenme Akışı" },
          {
            type: "ul",
            items: ["Giriş → Pratik → Proje → Değerlendirme"],
          },
          {
            type: "ul",
            items: [
              "Her modülde:",
              "“Bu bölümde şunu öğreneceğiz”",
              "1 uygulama → 1 açıklama → 1 pratik",
            ],
          },
          { type: "h4", text: "📎 Bonus Materyaller" },
          {
            type: "ul",
            items: [
              "PDF notlar",
              "Kod dosyaları (GitHub / Google Drive)",
              "Kaynak linkleri",
              "Mini quizler",
            ],
          },
          {
            type: "ul",
            items: [
              "Gerçek bir proje oluştur: Kurs sonunda üretilecek bir çıktı olsun (web sitesi, tablo, kampanya planı vb.).",
              "Projeyi adım adım işle: “Bölüm 1 – Hazırlık”, “Bölüm 2 – Kurulum”, “Bölüm 3 – İnşa”, “Bölüm 4 – Yayınla”.",
              "Alıştırmalar: Her modül sonunda 3-5 soru / uygulama ödevi",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "yayinlama",
    number: 4,
    title: "Yayınlama ve Optimizasyon Süreci",
    summary: "Yayın, analiz ve pazarlama",
    subsections: [
      {
        id: "yayinlama-sureci",
        title: "4. Yayınlama ve Optimizasyon Süreci",
        blocks: [
          {
            type: "ul",
            items: [
              "Yüklemeden önce:",
              "Her videoyu tek tek isimlendir.",
              "Bölümler sıralı ve mantıklı mı kontrol et.",
              "Quiz ve kaynakları da yükle.",
            ],
          },
          {
            type: "ul",
            items: [
              "Yayın sonrası:",
              "Kurs analizlerine bak: İzlenme oranı, quiz sonuçları, drop rate.",
              "Geri bildirimleri değerlendir. 3 ayda bir kursu güncelle.",
            ],
          },
        ],
      },
      {
        id: "pazarlama",
        title: "Pazarlama – Akademi Dışında Tanıtım",
        blocks: [
          {
            type: "ul",
            items: [
              "LinkedIn, Instagram, Twitter’da paylaş.",
              "YouTube’a tanıtım videoları koy.",
              "E-posta listesi oluştur.",
              "Telegram / Discord grubu kur → topluluk oluştur.",
              "İlk 1 haftada %100 kupon + geri bildirim isteyen e-posta at.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "ogrenci-destek",
    number: 5,
    title: "Öğrenci Desteği, Güncelleme ve İyileştirme Döngüsü",
    summary: "Destek, güncelleme ve yeni kurslar",
    subsections: [
      {
        id: "ogrenci-destegi",
        title: "5. Öğrenci Desteği – Fark Yarat",
        blocks: [
          { type: "ul", items: ["Soru-cevap kısmını aktif kullan."] },
          {
            type: "ul",
            items: [
              "Cevap süresi: max 24 saat (puanlamaya katkı sağlar).",
            ],
          },
          {
            type: "ul",
            items: [
              "Aylık canlı soru-cevap oturumu düzenle (Zoom, Discord).",
            ],
          },
        ],
      },
      {
        id: "guncelleme-dongusu",
        title: "Güncelleme ve İyileştirme Döngüsü",
        blocks: [
          {
            type: "ul",
            items: [
              "Geri bildirimleri düzenli topla:",
              "“Bu kısım çok hızlıydı.”",
              "“Uygulama örneği eksikti.”",
            ],
          },
          {
            type: "ul",
            items: [
              "Her 3 ayda bir güncelleme:",
              "Yeni modül, yeni uygulama, yeni teknoloji.",
            ],
          },
          {
            type: "ul",
            items: [
              "Yılda 1 kez büyük revizyon:",
              "Tasarım, ses, video standardı güncelle.",
            ],
          },
        ],
      },
      {
        id: "ikinci-kurs",
        title: "İkinci ve Üçüncü Kurs Stratejisi",
        blocks: [
          {
            type: "ul",
            items: [
              "Mevcut kursu alanların seviyesine göre devam kursu hazırla.",
              "Örn: “Excel Temelleri” → “Excel ile Finansal Modelleme”.",
            ],
          },
          {
            type: "ul",
            items: [
              "Cross-promo yap: Yeni kursa özel kuponu eski kurs öğrencilerine gönder.",
            ],
          },
        ],
      },
    ],
  },
];

export const instructorGuideToc = instructorGuideChapters.map((chapter) => ({
  id: chapter.id,
  number: chapter.number,
  title: chapter.title,
}));
