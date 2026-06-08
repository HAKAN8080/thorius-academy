import { notFound } from "next/navigation";
import { getCertificateById } from "@/lib/certificate/certificate-repository";
import { formatCertificateDate } from "@/lib/certificate/format-date";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function CertificateVerifyPage({ params }: Props) {
  const { id } = await params;
  const certificate = await getCertificateById(id);

  if (!certificate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-primary-50/40 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-2xl border border-[#D4AF37]/40 bg-white p-8 shadow-lg">
        <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37]">
          Thorius Academy
        </p>
        <h1 className="mb-6 text-center text-2xl font-bold text-[#0B1E3F]">
          Katılım Belgesi Doğrulama
        </h1>

        <div className="space-y-4 rounded-xl bg-[#0B1E3F] p-6 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#D4AF37]">
              Katılımcı
            </p>
            <p className="text-lg font-semibold">{certificate.participant_name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#D4AF37]">Kurs</p>
            <p className="text-lg font-semibold italic text-[#D4AF37]">
              {certificate.course_title}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#D4AF37]">
              Tamamlanma Tarihi
            </p>
            <p className="text-base">
              {formatCertificateDate(certificate.issued_at)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#D4AF37]">
              Belge No
            </p>
            <p className="break-all font-mono text-sm">{certificate.id}</p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-primary-700">
          Bu belge Thorius Academy tarafından verilmiş geçerli bir katılım
          belgesidir.
        </p>
      </div>
    </main>
  );
}
