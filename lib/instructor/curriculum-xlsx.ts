import ExcelJS from "exceljs";

export type CurriculumImportRow = {
  sectionTitle: string;
  lessonTitle: string;
  videoUrl: string;
  type: "video" | "text";
  isFreePreview: boolean;
};

const HEADERS = [
  "Bölüm",
  "Ders",
  "Video URL",
  "Tür (video/metin)",
  "Ücretsiz önizleme (evet/hayır)",
] as const;

function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (typeof value === "object" && "text" in value) {
    const text = (value as { text?: unknown }).text;
    return typeof text === "string" ? text.trim() : "";
  }
  if (typeof value === "object" && "result" in value) {
    return cellText((value as { result?: unknown }).result);
  }
  return String(value).trim();
}

function parseLessonType(raw: string): "video" | "text" {
  const normalized = raw.trim().toLocaleLowerCase("tr-TR");
  if (
    normalized === "metin" ||
    normalized === "text" ||
    normalized === "yazı" ||
    normalized === "yazi"
  ) {
    return "text";
  }
  return "video";
}

function parseFreePreview(raw: string): boolean {
  const normalized = raw.trim().toLocaleLowerCase("tr-TR");
  return (
    normalized === "evet" ||
    normalized === "yes" ||
    normalized === "true" ||
    normalized === "1" ||
    normalized === "ücretsiz" ||
    normalized === "ucretsiz"
  );
}

export async function buildCurriculumTemplateBuffer(): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Thorius Academy";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Müfredat", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = [
    { header: HEADERS[0], key: "section", width: 28 },
    { header: HEADERS[1], key: "lesson", width: 40 },
    { header: HEADERS[2], key: "videoUrl", width: 55 },
    { header: HEADERS[3], key: "type", width: 18 },
    { header: HEADERS[4], key: "free", width: 28 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.commit();

  sheet.addRow({
    section: "Giriş",
    lesson: "Hoş geldiniz",
    videoUrl: "",
    type: "video",
    free: "evet",
  });
  sheet.addRow({
    section: "Giriş",
    lesson: "Kurs hakkında",
    videoUrl: "",
    type: "metin",
    free: "hayır",
  });
  sheet.addRow({
    section: "Modül 1",
    lesson: "İlk ders",
    videoUrl: "https://ornek.b-cdn.net/ders-1.mp4",
    type: "video",
    free: "hayır",
  });

  const guide = workbook.addWorksheet("Talimatlar");
  guide.getColumn(1).width = 100;
  guide.addRow(["Thorius Academy — Müfredat Excel Şablonu"]);
  guide.addRow([]);
  guide.addRow([
    "1. Aynı Bölüm adı altındaki satırlar tek bölümde gruplanır (sıra: Excel’deki görünüm sırası).",
  ]);
  guide.addRow(["2. Ders sütunu zorunludur. Boş ders satırları atlanır."]);
  guide.addRow([
    "3. Video URL boş bırakılabilir; sonra panelden eklenebilir. MP4 / CDN linkleri desteklenir.",
  ]);
  guide.addRow([
    "4. Tür: video veya metin. Boş bırakılırsa video kabul edilir.",
  ]);
  guide.addRow([
    "5. Ücretsiz önizleme: evet / hayır. Boş bırakılırsa hayır.",
  ]);
  guide.addRow([
    "6. Yükleme mevcut bölüm ve dersleri siler ve Excel’den yeniden oluşturur.",
  ]);
  guide.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function parseCurriculumXlsx(
  data: ArrayBuffer | Buffer,
): Promise<{ rows: CurriculumImportRow[] } | { error: string }> {
  try {
    const workbook = new ExcelJS.Workbook();
    const bytes = Buffer.isBuffer(data) ? data : Buffer.from(data);
    // exceljs typings lag Node Buffer generics
    await workbook.xlsx.load(bytes as unknown as ArrayBuffer);

    const sheet =
      workbook.getWorksheet("Müfredat") ??
      workbook.worksheets.find((s) => s.name !== "Talimatlar") ??
      workbook.worksheets[0];

    if (!sheet) {
      return { error: "Excel dosyasında sayfa bulunamadı." };
    }

    const rows: CurriculumImportRow[] = [];
    let skipped = 0;

    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const sectionTitle = cellText(row.getCell(1).value);
      const lessonTitle = cellText(row.getCell(2).value);
      const videoUrl = cellText(row.getCell(3).value);
      const typeRaw = cellText(row.getCell(4).value);
      const freeRaw = cellText(row.getCell(5).value);

      if (!lessonTitle) {
        if (sectionTitle || videoUrl || typeRaw || freeRaw) {
          skipped += 1;
        }
        return;
      }

      rows.push({
        sectionTitle: sectionTitle || "Genel",
        lessonTitle,
        videoUrl,
        type: parseLessonType(typeRaw),
        isFreePreview: parseFreePreview(freeRaw),
      });
    });

    if (rows.length === 0) {
      return {
        error:
          skipped > 0
            ? "Geçerli ders satırı yok. Ders sütununu doldurun."
            : "Excel’de içe aktarılacak satır bulunamadı.",
      };
    }

    return { rows };
  } catch {
    return { error: "Excel dosyası okunamadı. .xlsx formatında olduğundan emin olun." };
  }
}
