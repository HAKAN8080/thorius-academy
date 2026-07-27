import * as React from "react";

export interface EbookPurchaseEmailProps {
  customerName: string;
  bookTitle: string;
  accessLink: string;
  orderTotal: string;
}

export function EbookPurchaseEmail({
  customerName,
  bookTitle,
  accessLink,
  orderTotal,
}: EbookPurchaseEmailProps): React.ReactElement {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Thorius Kitaplık - Kitabınız Hazır</title>
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f8fafc",
          fontFamily: "Inter, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            padding: "40px 20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#0B1E3F",
              padding: "32px",
              borderRadius: "16px 16px 0 0",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                color: "#D4AF37",
                margin: 0,
                fontSize: "28px",
                fontWeight: 800,
              }}
            >
              THORIUS KİTAPLIK
            </h1>
          </div>

          <div
            style={{
              backgroundColor: "white",
              padding: "40px 32px",
              borderRadius: "0 0 16px 16px",
              boxShadow: "0 4px 24px rgba(11, 30, 63, 0.08)",
            }}
          >
            <h2 style={{ color: "#060f24", marginTop: 0 }}>
              Merhaba, {customerName}!
            </h2>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              Satın alma işleminiz tamamlandı.
              <strong style={{ color: "#0B1E3F" }}> {bookTitle}</strong> e-kitabı
              hesabınıza tanımlandı.
            </p>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              Aşağıdaki butonla Kitaplarım paneline gidebilir, okuyabilir veya
              sesli dinleyebilirsiniz:
            </p>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a
                href={accessLink}
                style={{
                  display: "inline-block",
                  backgroundColor: "#D4AF37",
                  color: "#0B1E3F",
                  padding: "16px 40px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  textDecoration: "none",
                  boxShadow: "0 4px 12px rgba(212, 175, 55, 0.3)",
                }}
              >
                KİTAPLARIMA GİT →
              </a>
            </div>

            <div
              style={{
                backgroundColor: "#fdf9ec",
                padding: "20px",
                borderRadius: "10px",
                borderLeft: "4px solid #D4AF37",
                margin: "32px 0",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#0B1E3F",
                  fontWeight: 600,
                }}
              >
                Sipariş detayları
              </p>
              <p style={{ margin: 0, color: "#475569" }}>
                Tutar: <strong>{orderTotal}</strong>
                <br />
                Erişim: <strong>Hesabınıza tanımlı (indirilemez)</strong>
                <br />
                Destek: <strong>support@thorius.com.tr</strong>
              </p>
            </div>

            <ul
              style={{
                color: "#475569",
                lineHeight: 1.8,
                paddingLeft: "20px",
              }}
            >
              <li>Tarayıcıda güvenli okuma</li>
              <li>Sesli e-kitap (varsa) dahil</li>
              <li>İndirme yok — yalnızca Kitaplarım</li>
            </ul>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginTop: "32px",
              }}
            >
              Bu giriş linki sınırlı süre geçerlidir. Sorun yaşarsanız:{" "}
              <a
                href="mailto:support@thorius.com.tr"
                style={{ color: "#D4AF37" }}
              >
                support@thorius.com.tr
              </a>
            </p>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "24px",
              color: "#94a3b8",
              fontSize: "12px",
            }}
          >
            <p>© 2026 Thorius Eğitim ve Danışmanlık Ltd. Şti.</p>
            <p>kitaplik.thorius.com.tr</p>
          </div>
        </div>
      </body>
    </html>
  );
}
