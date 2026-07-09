"use client";

import { useState } from "react";
import Image from "next/image";
import { Award, BookMarked, Info, Receipt, Stamp } from "lucide-react";
import { Container } from "@/components/layout/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  COMPANY_ACCREDITATIONS,
  type CompanyAccreditation,
} from "@/lib/content/company-credentials";
import { cn } from "@/lib/utils";

const accreditationIcons = {
  "trademark-registration": Stamp,
  "publishing-license": BookMarked,
  "tax-plate": Receipt,
} as const;

function AccreditationCard({
  accreditation,
  onSelect,
}: {
  accreditation: CompanyAccreditation;
  onSelect: (item: CompanyAccreditation) => void;
}) {
  const Icon =
    accreditationIcons[accreditation.id as keyof typeof accreditationIcons] ??
    Award;

  return (
    <article className="group relative h-full">
      <button
        type="button"
        onClick={() => onSelect(accreditation)}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-2xl border border-primary-100 bg-white text-left shadow-sm transition-all",
          "hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-lg",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2",
        )}
        aria-label={`${accreditation.title} — belgeyi görüntüle`}
      >
        {accreditation.previewImageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden border-b border-primary-100 bg-slate-100">
            <Image
              src={accreditation.previewImageUrl}
              alt={`${accreditation.title} önizlemesi`}
              fill
              className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/55 via-transparent to-transparent" />
            <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-primary-950/75 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-300 backdrop-blur-sm">
              {accreditation.shortLabel}
            </span>
          </div>
        ) : null}

        <div className="flex flex-1 flex-col p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-900 to-primary-700 text-accent-400 shadow-inner">
              <Icon className="h-5 w-5" aria-hidden />
            </div>
            {accreditation.status === "verified" ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
                Doğrulanmış
              </span>
            ) : null}
          </div>

          <h3 className="text-lg font-bold text-primary-950">
            {accreditation.title}
          </h3>
          <p className="mt-1 text-sm font-medium text-primary-600">
            {accreditation.issuer}
          </p>
          <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-primary-700">
            {accreditation.description}
          </p>
          <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-accent-700">
            <Info className="h-3.5 w-3.5" aria-hidden />
            Detayları görüntüle
          </p>
        </div>
      </button>
    </article>
  );
}

export function CompanyAccreditationsSection() {
  const [selected, setSelected] = useState<CompanyAccreditation | null>(null);

  return (
    <>
      <section
        id="belgelerimiz"
        className="bg-primary-950 py-16 text-white md:py-20"
        aria-labelledby="accreditations-heading"
      >
        <Container size="narrow">
          <header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.24em] text-accent-400">
              Resmi belgeler
            </p>
            <h2
              id="accreditations-heading"
              className="text-3xl font-bold tracking-tight md:text-4xl"
            >
              Belgelerimiz / Sertifikalarımız
            </h2>
            <p className="mt-4 text-base leading-relaxed text-primary-100/90">
              Marka tescili, yayınevi faaliyeti ve vergi levhamız kamuya açık
              şekilde paylaşılmaktadır.
            </p>
          </header>

          <ul className="mx-auto grid max-w-5xl list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {COMPANY_ACCREDITATIONS.map((accreditation) => (
              <li key={accreditation.id} className="h-full">
                <AccreditationCard
                  accreditation={accreditation}
                  onSelect={setSelected}
                />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        {selected ? (
          <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-primary-100 p-0 sm:max-w-4xl">
            <div className="border-b border-primary-100 px-6 py-5">
              <DialogHeader>
                <DialogTitle className="text-primary-950">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-primary-600">
                  {selected.issuer}
                </DialogDescription>
              </DialogHeader>
              <p className="mt-3 text-sm leading-relaxed text-primary-700">
                {selected.description}
              </p>
            </div>

            {selected.previewImageUrl ? (
              <div className="px-6 py-5">
                <div className="overflow-hidden rounded-xl border border-primary-100 bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selected.previewImageUrl}
                    alt={selected.title}
                    className="h-auto w-full"
                  />
                </div>
              </div>
            ) : null}
          </DialogContent>
        ) : null}
      </Dialog>
    </>
  );
}
