import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Thorius Academy - Perakendenin Yeni Nesil Akademisi",
    template: "%s | Thorius Academy",
  },
  description:
    "Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş premium eğitim deneyimi. Perakende planlama, AI & veri, liderlik, operasyon kursları.",
  keywords: [
    "perakende eğitimi",
    "merchandising",
    "OTB",
    "open-to-buy",
    "retail academy",
    "B2B eğitim",
    "perakende planlama",
    "yapay zeka perakende",
    "liderlik kursu",
    "Türkiye",
  ],
  authors: [{ name: "Thorius Eğitim ve Danışmanlık Ltd. Şti." }],
  creator: "Thorius Academy",
  publisher: "Thorius Eğitim ve Danışmanlık Ltd. Şti.",
  metadataBase: new URL("https://academy.thorius.com.tr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Thorius Academy - Perakendenin Yeni Nesil Akademisi",
    description:
      "Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş premium eğitim deneyimi.",
    url: "https://academy.thorius.com.tr",
    siteName: "Thorius Academy",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Thorius Academy",
    description: "Perakendenin Yeni Nesil Akademisi",
    creator: "@thorius",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
