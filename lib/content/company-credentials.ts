/** Resmi şirket künyesi ve kurumsal belge meta verileri — Thorius Academy */

export const COMPANY_PROFILE = {
  legalName: "Thorius Eğitim ve Danışmanlık Ltd. Şti.",
  brandName: "Thorius Academy",
  activityAreas: [
    "Kurumsal Perakende Danışmanlığı",
    "Profesyonel Eğitim Yönetimi",
    "Dijital Akademi",
    "Stratejik Planlama ve AI Entegrasyonu",
  ],
  mersisNo: "0843090202300001",
  tradeRegistryNo: "1085795",
  taxOffice: "İSTANBUL - Beşiktaş",
  taxNo: "8430902023",
} as const;

export interface CompanyAccreditation {
  id: string;
  title: string;
  issuer: string;
  shortLabel: string;
  description: string;
  status: "verified" | "placeholder";
  previewImageUrl?: string;
}

export const COMPANY_ACCREDITATIONS: CompanyAccreditation[] = [
  {
    id: "trademark-registration",
    title: "Marka Tescil Belgesi",
    issuer: "Türk Patent ve Marka Kurumu",
    shortLabel: "TPMK",
    description:
      "Thorius markası 6769 sayılı Sınai Mülkiyet Kanunu kapsamında 17.10.2025 tarihinde tescil edilmiştir (Başvuru No: 2025/065193). Mal ve hizmet sınıfları: 09, 35, 41, 42.",
    status: "verified",
    previewImageUrl: "/documents/credentials/marka-tescil-sayfa-1.png",
  },
  {
    id: "publishing-license",
    title: "Yayınevi Faaliyet Belgesi",
    issuer: "Kültür ve Turizm Bakanlığı",
    shortLabel: "KTB",
    description:
      "5846 sayılı Fikir ve Sanat Eserleri Kanunu uyarınca yayınevi faaliyet sertifikası (No: 83851). Geçerlilik: 9.07.2026 – 9.07.2030.",
    status: "verified",
    previewImageUrl: "/documents/credentials/yayinevi-faaliyet-belgesi.png",
  },
  {
    id: "tax-plate",
    title: "Vergi Levhası",
    issuer: "Gelir İdaresi Başkanlığı",
    shortLabel: "GİB",
    description:
      "Thorius Eğitim ve Danışmanlık Ltd. Şti. Beşiktaş Vergi Dairesi mükellefiyeti (VKN: 8430902023). Ana faaliyet: bilgisayar danışmanlığı ve sistem yönetimi.",
    status: "verified",
    previewImageUrl: "/documents/credentials/vergi-levhasi.png",
  },
];
