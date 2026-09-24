/** Upload rules for the `resources` bucket (mirrors the bucket's MIME list and size limit). */

export const RESOURCES_BUCKET = "resources";

export const MAX_RESOURCE_BYTES = 20 * 1024 * 1024;

const RESOURCE_TYPES = {
  "application/pdf": { ext: ["pdf"], label: "PDF" },
  "image/jpeg": { ext: ["jpg", "jpeg"], label: "صورة" },
  "image/png": { ext: ["png"], label: "صورة" },
  "image/webp": { ext: ["webp"], label: "صورة" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { ext: ["docx"], label: "Word" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": { ext: ["pptx"], label: "PowerPoint" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { ext: ["xlsx"], label: "Excel" },
} as const;

type ResourceType = keyof typeof RESOURCE_TYPES;

export const RESOURCE_ACCEPT = Object.entries(RESOURCE_TYPES)
  .flatMap(([type, { ext }]) => [type, ...ext.map((e) => `.${e}`)])
  .join(",");

export function isResourceType(type: string): type is ResourceType {
  return type in RESOURCE_TYPES;
}

export function resourceTypeLabel(mime: string | null): string {
  return mime && isResourceType(mime) ? RESOURCE_TYPES[mime].label : "ملف";
}

/** Arabic error message, or null when the file may be uploaded. */
export function validateResourceFile(file: { name: string; type: string; size: number }): string | null {
  if (!isResourceType(file.type)) return "نوع الملف غير مدعوم. المسموح: PDF، Word، PowerPoint، Excel، JPG، PNG، WebP.";
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!(RESOURCE_TYPES[file.type].ext as readonly string[]).includes(ext)) return "امتداد الملف لا يطابق نوعه.";
  if (file.size <= 0) return "الملف فارغ.";
  if (file.size > MAX_RESOURCE_BYTES) return "حجم الملف أكبر من 20 ميجابايت.";
  return null;
}

/** Unique key: 2026/09/<uuid>.<ext> (the original name is stored separately). */
export function buildResourcePath(type: string): string {
  const ext = isResourceType(type) ? RESOURCE_TYPES[type].ext[0] : "bin";
  const now = new Date();
  return `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
}

export const RESOURCE_PATH_PATTERN =
  /^\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(pdf|jpg|png|webp|docx|pptx|xlsx)$/;
