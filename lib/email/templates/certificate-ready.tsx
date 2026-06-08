import * as React from "react";

export interface CertificateReadyEmailProps {
  customerName: string;
  courseTitle: string;
  certificateUrl: string;
}

export function CertificateReadyEmail({
  customerName,
  courseTitle,
  certificateUrl,
}: CertificateReadyEmailProps): React.ReactElement {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Katılım Belgeniz Hazır</title>
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
                fontSize: "24px",
                fontWeight: 800,
              }}
            >
              KATILIM BELGESİ
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
            <h2 style={{ color: "#0B1E3F", marginTop: 0 }}>
              Tebrikler, {customerName}!
            </h2>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              <strong style={{ color: "#0B1E3F" }}>{courseTitle}</strong> eğitimini
              başarıyla tamamladınız. Katılım belgeniz ekte yer almaktadır.
            </p>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a
                href={certificateUrl}
                style={{
                  display: "inline-block",
                  backgroundColor: "#D4AF37",
                  color: "#0B1E3F",
                  padding: "14px 28px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: 700,
                  fontSize: "15px",
                }}
              >
                Belgeyi İndir
              </a>
            </div>

            <p style={{ color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
              Belgeyi dilediğiniz zaman panelinizden de indirebilirsiniz.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
