export interface TableVisualData {
  headers: string[];
  rows: (string | number)[][];
}

export function renderTableSvg(data: TableVisualData): string {
  const colCount = data.headers.length;
  const rowCount = data.rows.length + 1;
  const cellW = 140;
  const cellH = 36;
  const width = colCount * cellW + 2;
  const height = rowCount * cellH + 2;

  const cells: string[] = [];

  data.headers.forEach((header, col) => {
    const x = col * cellW + 1;
    cells.push(
      `<rect x="${x}" y="1" width="${cellW}" height="${cellH}" fill="#0B1E3F"/>`,
      `<text x="${x + cellW / 2}" y="${1 + cellH / 2 + 5}" fill="#FFFFFF" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle">${escapeXml(header)}</text>`,
    );
  });

  data.rows.forEach((row, rowIndex) => {
    row.forEach((cell, col) => {
      const x = col * cellW + 1;
      const y = (rowIndex + 1) * cellH + 1;
      const fill = rowIndex % 2 === 0 ? "#F8FAFC" : "#FFFFFF";
      cells.push(
        `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" fill="${fill}" stroke="#E2E8F0"/>`,
        `<text x="${x + cellW / 2}" y="${y + cellH / 2 + 5}" fill="#0B1E3F" font-family="system-ui,sans-serif" font-size="13" text-anchor="middle">${escapeXml(String(cell))}</text>`,
      );
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Veri tablosu">${cells.join("")}</svg>`;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
