import * as React from "react";
import type { PromoCourse } from "@/lib/campaign/pick-promo-courses";
import { getSiteUrl } from "@/lib/seo/site-url";

export interface MembershipRenewalEmailProps {
  customerName: string;
  passwordRenewalLink: string;
  promoCourses: PromoCourse[];
}

export function MembershipRenewalEmail({
  customerName,
  passwordRenewalLink,
  promoCourses,
}: MembershipRenewalEmailProps): React.ReactElement {
  const siteUrl = getSiteUrl();

  return (
    <html lang="tr">
      <head>
        <meta charSet="utf-8" />
        <title>Thorius Academy - Üyelik Şifrenizi Yenileyin</title>
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
              Thorius Academy yeni platformuna geçiş sürecinde üyelik
              güvenliğiniz için şifrenizin yenilenmesi gerekiyor. Mevcut
              kurslarınız ve izleme ilerlemeniz korunuyor; yalnızca yeni
              panele giriş için şifrenizi güncellemeniz yeterli.
            </p>

            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                padding: "16px 20px",
                margin: "24px 0",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#991b1b",
                  fontSize: "15px",
                  fontWeight: 600,
                }}
              >
                Üyelik şifrenizin süresi doldu
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  color: "#7f1d1d",
                  fontSize: "14px",
                  lineHeight: 1.5,
                }}
              >
                Aşağıdaki bağlantıyla yeni şifrenizi belirleyin ve kaldığınız
                yerden devam edin.
              </p>
            </div>

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
                YENİ ŞİFRE BELİRLE →
              </a>
            </div>

            {promoCourses.length > 0 && (
              <>
                <h3
                  style={{
                    color: "#0B1E3F",
                    marginTop: "36px",
                    marginBottom: "16px",
                    fontSize: "20px",
                  }}
                >
                  Yeni Eklenen Kurslar
                </h3>

                {promoCourses.map((course) => (
                  <div
                    key={course.slug}
                    style={{
                      border: "1px solid #dce5f1",
                      borderRadius: "12px",
                      padding: "16px 18px",
                      marginBottom: "12px",
                    }}
                  >
                    {course.category && (
                      <p
                        style={{
                          margin: "0 0 6px",
                          color: "#9c7d20",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        {course.category}
                      </p>
                    )}
                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#060f24",
                        fontSize: "16px",
                        fontWeight: 700,
                      }}
                    >
                      {course.title}
                    </p>
                    <p
                      style={{
                        margin: "0 0 12px",
                        color: "#64748b",
                        fontSize: "14px",
                        lineHeight: 1.5,
                      }}
                    >
                      {course.excerpt}
                    </p>
                    <a
                      href={`${siteUrl}/kurslar/${course.slug}`}
                      style={{
                        color: "#0B1E3F",
                        fontSize: "14px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Kursu incele →
                    </a>
                  </div>
                ))}
              </>
            )}

            <div style={{ textAlign: "center", marginTop: "28px" }}>
              <a
                href={`${siteUrl}/kurslar`}
                style={{
                  display: "inline-block",
                  backgroundColor: "#D4AF37",
                  color: "#0B1E3F",
                  padding: "14px 32px",
                  borderRadius: "12px",
                  fontSize: "15px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                TÜM KURSLARI GÖR →
              </a>
            </div>

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
