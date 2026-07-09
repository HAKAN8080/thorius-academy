import type { Metadata } from "next";
import { AboutPageView } from "@/components/marketing/about-page-view";

export const metadata: Metadata = {
  title: "Hakkımızda | Thorius Academy",
  description:
    "Thorius Academy misyon, vizyon ve değerleri. Resmi şirket künyesi, MERSIS ve kurumsal belgeler — erişilebilir, kaliteli dijital eğitimler.",
};

export default function HakkimizdaPage() {
  return <AboutPageView />;
}
