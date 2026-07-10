import { getTranslations } from "next-intl/server";

export type LegalSection = {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  intro?: string[];
  sections: LegalSection[];
  footerNote?: string;
};

export async function LegalDocumentView({
  namespace,
}: {
  namespace: "kvkk" | "privacy" | "distanceSales" | "terms";
}) {
  const t = await getTranslations("legal");
  const doc = t.raw(namespace) as LegalDocument;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      <header className="mb-12">
        <h1 className="mb-3 text-3xl font-bold text-primary-950 md:text-4xl">
          {doc.title}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("lastUpdatedLabel")} {doc.lastUpdated}
        </p>
      </header>

      <div className="prose prose-lg max-w-none prose-headings:text-primary-950 prose-a:text-accent-600">
        {doc.intro?.map((paragraph) => (
          <p key={paragraph.slice(0, 40)}>{paragraph}</p>
        ))}

        {doc.sections.map((section) => (
          <section key={section.heading ?? section.paragraphs?.[0]?.slice(0, 30)}>
            {section.heading ? <h2>{section.heading}</h2> : null}
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
            {section.list && section.list.length > 0 ? (
              <ul>
                {section.list.map((item) => (
                  <li key={item.slice(0, 48)}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}

        {doc.footerNote ? (
          <p className="text-sm text-muted-foreground">{doc.footerNote}</p>
        ) : null}
      </div>
    </div>
  );
}
