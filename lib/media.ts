/** Upload rules shared by the browser (early feedback) and the server action (enforcement).
 *  The storage bucket enforces the same MIME types and size limit (see the migration). */

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/gif": ["gif"],
  "image/avif": ["avif"],
} as const satisfies Record<string, readonly string[]>;

export type AllowedImageType = keyof typeof ALLOWED_IMAGE_TYPES;

export const ACCEPT_ATTRIBUTE = Object.keys(ALLOWED_IMAGE_TYPES).join(",");

export function isAllowedImageType(type: string): type is AllowedImageType {
  return type in ALLOWED_IMAGE_TYPES;
}

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

/** Returns an Arabic error message, or null when the file may be uploaded. */
export function validateImageFile(file: { name: string; type: string; size: number }): string | null {
  if (!isAllowedImageType(file.type)) {
    return "نوع الملف غير مدعوم. الأنواع المسموحة: JPG، PNG، WebP، GIF، AVIF.";
  }
  if (!(ALLOWED_IMAGE_TYPES[file.type] as readonly string[]).includes(extensionOf(file.name))) {
    return "امتداد الملف لا يطابق نوعه.";
  }
  if (file.size <= 0) return "الملف فارغ.";
  if (file.size > MAX_UPLOAD_BYTES) return "حجم الملف أكبر من 5 ميجابايت. جرّبي ضغط الصورة أولًا.";
  return null;
}

/** "My Photo (1).JPG" → "my-photo-1" (ASCII only, for storage keys). */
function safeBaseName(name: string): string {
  const base = name.replace(/\.[^.]+$/, "");
  const ascii = base
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .slice(0, 60);
  return ascii || "image";
}

/** Unique storage key: 2026/09/<uuid>-<name>.<ext> */
export function buildStoragePath(fileName: string, type: AllowedImageType): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = ALLOWED_IMAGE_TYPES[type][0];
  return `${now.getFullYear()}/${month}/${crypto.randomUUID()}-${safeBaseName(fileName)}.${ext}`;
}

/** PostgREST `or` filter searching file name and alt text (reserved characters removed). */
export function mediaSearchFilter(q: string): string {
  const term = q.replace(/[,()"\\%_*]/g, " ").trim();
  return `file_name.ilike.*${term}*,alt_text.ilike.*${term}*`;
}

/** Storage keys produced by buildStoragePath — anything else is rejected server-side. */
export const STORAGE_PATH_PATTERN =
  /^\d{4}\/\d{2}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[a-z0-9-]{1,60}\.(jpg|png|webp|gif|avif)$/;
