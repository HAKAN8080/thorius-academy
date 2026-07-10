/** Ana sayfa — ücretsiz kurs vitrin sütunları (sıra önemli). */

export const FREE_HUB_COLUMNS = [
  {
    id: "satranc",
    title: "Satranç",
    categorySlug: "satranc",
    categoryMatches: ["Satranç", "satranc"],
    accentClass: "from-sky-50 to-sky-100/80 border-sky-200/80",
  },
  {
    id: "ingilizce",
    title: "İngilizce",
    categorySlug: "ingilizce-egitimi",
    categoryMatches: ["İngilizce Eğitimi", "İngilizce", "ingilizce"],
    accentClass: "from-indigo-50 to-indigo-100/80 border-indigo-200/80",
  },
  {
    id: "bilgi-teknolojileri",
    title: "Bilgi Teknolojileri",
    categorySlug: "bilgi-teknolojileri",
    categoryMatches: ["Bilgi Teknolojileri", "bilgi teknoloji", "bt"],
    accentClass: "from-cyan-50 to-cyan-100/80 border-cyan-200/80",
  },
] as const;
