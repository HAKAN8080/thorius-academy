import { Download, FileSpreadsheet, FileText } from "lucide-react";

interface LessonAttachmentLink {
  href: string;
  label: string;
  icon: typeof FileText;
}

interface LessonAttachmentsProps {
  pdfUrl?: string | null;
  pdfName?: string | null;
  excelUrl?: string | null;
  excelName?: string | null;
}

export function LessonAttachments({
  pdfUrl,
  pdfName,
  excelUrl,
  excelName,
}: LessonAttachmentsProps) {
  const attachments: LessonAttachmentLink[] = [];

  if (pdfUrl) {
    attachments.push({
      href: pdfUrl,
      label: pdfName || "Ek PDF",
      icon: FileText,
    });
  }

  if (excelUrl) {
    attachments.push({
      href: excelUrl,
      label: excelName || "Excel Şablonu",
      icon: FileSpreadsheet,
    });
  }

  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-primary-100 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-500">
        Ders Materyalleri
      </h3>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {attachments.map((attachment) => {
          const Icon = attachment.icon;
          return (
            <a
              key={attachment.href}
              href={attachment.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-primary-100 px-4 py-3 text-sm font-medium text-primary-900 transition hover:border-accent-500/40 hover:bg-primary-50"
            >
              <Icon className="h-4 w-4 text-accent-600" />
              <span>{attachment.label}</span>
              <Download className="ml-1 h-4 w-4 text-primary-400" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
