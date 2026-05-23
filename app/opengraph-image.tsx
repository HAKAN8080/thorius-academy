import { ImageResponse } from "next/og"

// Sosyal medya paylaşım kartı (1200x630)
// WhatsApp, LinkedIn, Twitter, Facebook'ta bu görüntü çıkar
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Thorius Academy - Perakendenin Yeni Nesil Akademisi"

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0B1E3F 0%, #060f24 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 110,
            fontWeight: 900,
            color: "white",
            letterSpacing: -3,
            display: "flex",
            alignItems: "center",
          }}
        >
          THORIUS
          <span style={{ color: "#D4AF37", marginLeft: 4 }}>.</span>
        </div>
        <div
          style={{
            fontSize: 36,
            color: "#D4AF37",
            marginTop: 24,
            fontWeight: 600,
            letterSpacing: -1,
          }}
        >
          Perakendenin Yeni Nesil Akademisi
        </div>
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.7)",
            marginTop: 40,
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.4,
          }}
        >
          Sektörün en deneyimli isimlerinden, AI ile zenginleştirilmiş premium eğitim deneyimi
        </div>
        <div
          style={{
            fontSize: 18,
            color: "rgba(212,175,55,0.8)",
            marginTop: 60,
            fontWeight: 500,
          }}
        >
          academy.thorius.com.tr
        </div>
      </div>
    ),
    { ...size }
  )
}