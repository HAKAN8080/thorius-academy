import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * Anasayfa hero bölümü
 * Lacivert gradient background + altın aksent başlık
 * Mobile-first responsive tasarım
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-950 to-primary-900 py-12 sm:py-16 md:py-24 lg:py-32">
      {/* Subtle altın aksent (sağ üst köşede) */}
      <div className="absolute right-0 top-0 h-96 w-96 bg-accent-500/5 blur-3xl rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Sol kolon: Başlık + CTA */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Premium Badge */}
            <div className="inline-flex">
              <span className="inline-block bg-accent-500/10 border border-accent-500/30 text-accent-400 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                Premium B2B Perakende Akademisi
              </span>
            </div>

            {/* Ana Başlık - Mobile-first agresif sizing */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-tight text-white max-w-3xl">
              Perakendenin{" "}
              <span className="bg-gradient-to-r from-accent-400 to-accent-600 bg-clip-text text-transparent">
                Yeni Nesil
              </span>{" "}
              Akademisi
            </h1>

            {/* Alt Başlık */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed text-primary-100 max-w-2xl">
              Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş premium eğitim deneyimi
            </p>

            {/* CTA Butonları - Mobilde alt alta, desktop'ta yan yana */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto bg-accent-500 hover:bg-accent-600 text-primary-950 font-semibold"
              >
                <Link href="/kurslar">Kurslara Göz At</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-primary-950 bg-transparent"
              >
                <Link href="/kurumsal">Kurumsal Çözüm</Link>
              </Button>
            </div>
          </div>

          {/* Sağ kolon: Dekoratif Görsel (mobilde gizli) */}
          <div className="hidden lg:block">
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Background gradient kart */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-950 rounded-3xl border border-accent-500/20 backdrop-blur-sm shadow-2xl" />

              {/* Dekoratif SVG grafik */}
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <svg
                  viewBox="0 0 400 400"
                  className="w-full h-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  {/* Yükselen barlar */}
                  <rect x="80" y="280" width="60" height="80" rx="8" fill="#1e3a6f" />
                  <rect x="170" y="200" width="60" height="160" rx="8" fill="#3b5998" />
                  <rect x="260" y="120" width="60" height="240" rx="8" fill="#D4AF37" opacity="0.9" />

                  {/* Yükselen trend çizgisi */}
                  <path
                    d="M 110 300 L 200 220 L 290 140"
                    stroke="#D4AF37"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />

                  {/* Noktalar */}
                  <circle cx="110" cy="300" r="6" fill="#D4AF37" />
                  <circle cx="200" cy="220" r="6" fill="#D4AF37" />
                  <circle cx="290" cy="140" r="8" fill="#D4AF37" />
                </svg>
              </div>

              {/* Alt etiket */}
              <div className="absolute bottom-6 left-0 right-0 text-center">
                <p className="text-primary-100 text-sm font-medium">
                  Veri odaklı perakende büyümesi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}