import * as React from "react";
import { SIGNUP_DISCOUNT_PERCENT } from "@/lib/constants/promo";

export interface SignupWelcomeEmailProps {
  customerName: string;
  couponCode: string;
  verificationLink: string;
}

export function SignupWelcomeEmail({
  customerName,
  couponCode,
  verificationLink,
}: SignupWelcomeEmailProps): React.ReactElement {
  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Thorius Academy - Hesabınızı Doğrulayın</title>
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
              THORIUS ACADEMY
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
              Hoş geldiniz, {customerName}!
            </h2>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              Thorius AI Academy ailesine katıldığınız için teşekkür ederiz.
              Hesabınızı etkinleştirmek için aşağıdaki butona tıklayın; ardından
              panele yönlendirileceksiniz.
            </p>

            <div style={{ textAlign: "center", margin: "28px 0" }}>
              <a
                href={verificationLink}
                style={{
                  display: "inline-block",
                  backgroundColor: "#0B1E3F",
                  color: "#ffffff",
                  padding: "16px 40px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                E-POSTAMI DOĞRULA →
              </a>
            </div>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Buton çalışmıyorsa bu bağlantıyı tarayıcınıza yapıştırın:
              <br />
              <a href={verificationLink} style={{ color: "#D4AF37" }}>
                {verificationLink}
              </a>
            </p>

            <div
              style={{
                backgroundColor: "#fef9c3",
                padding: "24px",
                borderRadius: "12px",
                border: "2px solid #D4AF37",
                textAlign: "center",
                margin: "32px 0 24px",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#854d0e",
                  fontSize: "13px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                İlk Üyelik Kuponunuz — %{SIGNUP_DISCOUNT_PERCENT} İndirim
              </p>
              <p
                style={{
                  margin: 0,
                  color: "#0B1E3F",
                  fontSize: "32px",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                }}
              >
                {couponCode}
              </p>
            </div>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              Kurs satın alırken ödeme adımında bu kodu girerek indiriminizi
              kullanabilirsiniz.
            </p>

            <div style={{ textAlign: "center", margin: "32px 0" }}>
              <a
                href="https://academy.thorius.com.tr/kurslar"
                style={{
                  display: "inline-block",
                  backgroundColor: "#D4AF37",
                  color: "#0B1E3F",
                  padding: "16px 40px",
                  borderRadius: "12px",
                  fontSize: "16px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                KURSLARI KEŞFET →
              </a>
            </div>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginTop: "32px",
              }}
            >
              Sorularınız için:{" "}
              <a
                href="mailto:support@thorius.com.tr"
                style={{ color: "#D4AF37" }}
              >
                support@thorius.com.tr
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
