import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function markdownToHtml(markdown: string | null | undefined): string {
  const source = markdown?.trim();
  if (!source) {
    return "";
  }

  const html = marked.parse(source, { async: false });
  return typeof html === "string" ? html : "";
}

export function stripMarkdown(markdown: string | null | undefined): string {
  const source = markdown?.trim();
  if (!source) {
    return "";
  }

  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_~>#-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
