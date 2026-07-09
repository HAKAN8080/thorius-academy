import { getSiteUrl } from "@/lib/seo/site-url";
import { COMPANY_PROFILE } from "@/lib/content/company-credentials";

export function buildAcademyOrganizationJsonLd() {
  const siteUrl = getSiteUrl();

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Thorius Academy",
      url: siteUrl,
      inLanguage: "tr-TR",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${siteUrl}/kurslar?ara={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "Thorius Academy",
      legalName: COMPANY_PROFILE.legalName,
      taxID: COMPANY_PROFILE.taxNo,
      url: siteUrl,
      logo: `${siteUrl}/images/thorius-logo.png`,
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+90-543-132-35-03",
        contactType: "customer service",
        availableLanguage: ["Turkish", "English"],
      },
    },
  ];
}
