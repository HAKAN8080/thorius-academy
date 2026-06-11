/** Thorius Eğitim ve Danışmanlık Ltd. — iş modeli ve anlatım metinleri */

export const COMPANY_LEGAL_NAME = "Thorius Eğitim ve Danışmanlık Ltd. Şti.";

export const COMPANY_FOUNDERS = [
  { name: "Dr. Elif Demir Uğur", role: "Kurucu Ortak" },
  { name: "M. Hakan Uğur", role: "Kurucu Ortak" },
] as const;

export const CONSULTING_DOMAINS = [
  "Tedarik zinciri",
  "Perakende planlama",
  "İnsan kaynakları",
] as const;

export const AI4U_RETAIL_URL = "https://siriusabcx.com/";

export const VALUE_CHAIN_STEPS = [
  {
    step: 1,
    title: "Danışmanlık & Audit",
    description:
      "Tedarik zinciri, planlama ve İK alanlarında süreçlerinizi birlikte inceliyor; yetkinlik ve operasyonel eksikleri netleştiriyoruz.",
    href: "/kurumsal",
    cta: "Danışmanlık talebi",
  },
  {
    step: 2,
    title: "AI4U Retail",
    description:
      "Audit sonuçlarına dayalı çözümleri AI destekli perakende yazılımımız AI4U Retail ile hayata geçiriyoruz.",
    href: AI4U_RETAIL_URL,
    cta: "AI4U Retail'e git",
    external: true,
  },
  {
    step: 3,
    title: "Thorius Academy",
    description:
      "Çözümün sürdürülebilir olması için ekiplerinizi Thorius-LMS üzerinde eğitiyor; bilgiyi kalıcı yetkinliğe dönüştürüyoruz.",
    href: "/kurslar",
    cta: "Eğitimleri incele",
    academy: true,
  },
  {
    step: 4,
    title: "Thorius Coaching",
    description:
      "Bireysel kariyer ve liderlik gelişimi için koçluk ve mentorluk ile desteği tamamlıyoruz.",
    href: "https://coaching.thorius.com.tr",
    cta: "Coaching'e git",
    external: true,
  },
] as const;

export const COMPANY_HERO_SUBTITLE =
  "Dr. Elif Demir Uğur ve M. Hakan Uğur liderliğindeki Thorius Eğitim ve Danışmanlık; danışmanlık ve audit ile başlayan, AI4U Retail yazılımı ve Thorius Academy eğitimleriyle devam eden bütüncül bir dönüşüm modeli sunar.";

export const COMPANY_TAGLINE =
  "Audit ile eksikleri buluyor, AI4U ile çözüyor, Academy ile sürdürülebilir kılıyoruz.";

export const COMPANY_BRAND_LINE = "Danışmanlık · Yazılım · Eğitim";
