/** Plain text from stored rich-text HTML (for excerpts, reading time and metadata). */
export function htmlToText(html: string): string {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote)\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** Whether a stored value is editor HTML (fields that used to hold plain text may contain either). */
export function isRichHtml(value: string): boolean {
  return /^\s*<(p|h[1-6]|ul|ol|blockquote|pre|img|hr)[\s>/]/i.test(value);
}

/** Plain text for previews and metadata, whether the value is HTML or legacy plain text. */
export function toPlainText(value: string | null | undefined): string {
  if (!value) return "";
  return isRichHtml(value) ? htmlToText(value) : value.replace(/\s+/g, " ").trim();
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Legacy plain text → editor HTML (blank lines separate paragraphs, single newlines become <br>). */
export function plainTextToHtml(text: string): string {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Value to load into the rich-text editor. */
export function toEditorHtml(value: string | null | undefined): string {
  if (!value) return "";
  return isRichHtml(value) ? value : plainTextToHtml(value);
}

export function countWords(text: string): number {
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

export function truncate(text: string, max: number): string {
  return text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;
}
