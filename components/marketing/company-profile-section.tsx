import { Building2, Landmark, Receipt, Shield } from "lucide-react";
import { Container } from "@/components/layout/container";
import { COMPANY_PROFILE } from "@/lib/content/company-credentials";

const profileRows = [
  {
    id: "legal-name",
    label: "Şirket Unvanı",
    value: COMPANY_PROFILE.legalName,
    icon: Building2,
  },
  {
    id: "brand",
    label: "Marka / Platform",
    value: COMPANY_PROFILE.brandName,
    icon: Shield,
  },
  {
    id: "mersis",
    label: "MERSİS No",
    value: COMPANY_PROFILE.mersisNo,
    icon: Landmark,
  },
  {
    id: "trade-registry",
    label: "Ticaret Sicil No",
    value: COMPANY_PROFILE.tradeRegistryNo,
    icon: Landmark,
  },
  {
    id: "tax",
    label: "Vergi Dairesi / No",
    value: `${COMPANY_PROFILE.taxOffice} / ${COMPANY_PROFILE.taxNo}`,
    icon: Receipt,
  },
] as const;

export function CompanyProfileSection() {
  return (
    <section
      id="sirket-kunyesi"
      className="border-y border-primary-100 bg-gradient-to-b from-slate-50 via-white to-primary-50/40 py-16 md:py-20"
      aria-labelledby="company-profile-heading"
    >
      <Container size="narrow">
        <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-600">
            Kurumsal şeffaflık
          </p>
          <h2
            id="company-profile-heading"
            className="text-3xl font-bold tracking-tight text-primary-950 md:text-4xl"
          >
            Şirket Künyesi
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-700">
            Thorius Academy,{" "}
            <span className="font-medium text-primary-900">
              {COMPANY_PROFILE.legalName}
            </span>{" "}
            çatısı altında faaliyet gösteren dijital eğitim platformudur.
          </p>
        </header>

        <dl className="grid gap-4 sm:grid-cols-2">
          {profileRows.map(({ id, label, value, icon: Icon }) => (
            <div
              key={id}
              className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
            >
              <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-500">
                <Icon className="h-4 w-4 shrink-0 text-accent-600" aria-hidden />
                {label}
              </dt>
              <dd className="mt-3 text-base font-semibold leading-snug text-primary-950 sm:text-lg">
                {value}
              </dd>
            </div>
          ))}

          <div className="rounded-2xl border border-primary-100/80 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
            <dt className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Faaliyet Alanları
            </dt>
            <dd className="mt-4">
              <ul className="grid gap-2 sm:grid-cols-2">
                {COMPANY_PROFILE.activityAreas.map((area) => (
                  <li
                    key={area}
                    className="flex items-start gap-2 rounded-lg bg-primary-50/80 px-3 py-2.5 text-sm font-medium text-primary-800"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500"
                      aria-hidden
                    />
                    {area}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>
      </Container>
    </section>
  );
}
