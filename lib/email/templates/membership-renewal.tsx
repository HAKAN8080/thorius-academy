import * as React from "react";
import { RETAIL_PLANNING_PATH } from "@/lib/content/career-paths";
import { getSiteUrl } from "@/lib/seo/site-url";

export interface MembershipRenewalEmailProps {
  customerName: string;
  passwordRenewalLink: string;
}

export function MembershipRenewalEmail({
  customerName,
  passwordRenewalLink,
}: MembershipRenewalEmailProps): React.ReactElement {
  const siteUrl = getSiteUrl();
  const retailPathHref = `${siteUrl}/kariyer-yolu/${RETAIL_PLANNING_PATH.slug}`;

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Thorius Academy - Şifrenizi Yenileyin</title>
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
              Merhaba {customerName},
            </h2>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              <strong style={{ color: "#0B1E3F" }}>
                Güvenliğiniz bizim için önemli.
              </strong>{" "}
              <strong style={{ color: "#991b1b" }}>
                Şifrenizin süresi doldu.
              </strong>{" "}
              Lütfen aşağıdaki bağlantıyla giriş yaparak yeni şifrenizi
              belirleyin.
            </p>

            <p style={{ color: "#475569", fontSize: "16px", lineHeight: 1.6 }}>
              <strong style={{ color: "#0B1E3F" }}>Not:</strong> Artık
              platformumuz kendi yazılımımız{" "}
              <strong style={{ color: "#0B1E3F" }}>Thorius-LMS</strong> üzerinde
              çalışıyor.{" "}
              <strong style={{ color: "#0B1E3F" }}>Thorius Academy</strong>{" "}
              eğitimlerimiz yenilendi. Retail Planner kariyer yolu ile 5 farklı
              alandaki eğitim ile kariyerinize yön verin.
            </p>

            <div style={{ textAlign: "center", margin: "28px 0" }}>
              <a
                href={passwordRenewalLink}
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
                GİRİŞ YAP VE ŞİFREMİ YENİLE →
              </a>
            </div>

            <h3
              style={{
                color: "#0B1E3F",
                marginTop: "36px",
                marginBottom: "8px",
                fontSize: "20px",
              }}
            >
              Retail Planner Kariyer Yolu
            </h3>

            <p
              style={{
                color: "#64748b",
                fontSize: "15px",
                lineHeight: 1.6,
                marginTop: 0,
                marginBottom: "20px",
              }}
            >
              Perakende planlamada adım adım ilerleyin —{" "}
              <a
                href={retailPathHref}
                style={{ color: "#0B1E3F", fontWeight: 600, textDecoration: "none" }}
              >
                tüm yolu inceleyin →
              </a>
            </p>

            <ol
              style={{
                margin: 0,
                paddingLeft: "20px",
                color: "#475569",
                fontSize: "15px",
                lineHeight: 1.7,
              }}
            >
              {RETAIL_PLANNING_PATH.steps.map((step, index) => (
                <li
                  key={step.slug}
                  style={{
                    marginBottom: index < RETAIL_PLANNING_PATH.steps.length - 1 ? "16px" : 0,
                    paddingLeft: "4px",
                  }}
                >
                  <a
                    href={`${siteUrl}/kurslar/${step.slug}`}
                    style={{
                      color: "#0B1E3F",
                      fontWeight: 700,
                      fontSize: "16px",
                      textDecoration: "none",
                    }}
                  >
                    {step.label}
                  </a>
                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#64748b",
                      fontSize: "14px",
                      lineHeight: 1.5,
                    }}
                  >
                    {step.description}
                  </span>
                </li>
              ))}
            </ol>

            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                marginTop: "32px",
                lineHeight: 1.5,
              }}
            >
              Bu e-postayı beklemiyorsanız veya sorunuz varsa{" "}
              <a href="mailto:support@thorius.com.tr" style={{ color: "#D4AF37" }}>
                support@thorius.com.tr
              </a>{" "}
              adresine yazabilirsiniz.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
