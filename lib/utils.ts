import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export { formatDate } from "./datetime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicNumber(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function readingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 180));
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/** ILIKE pattern for user search input, with LIKE wildcards escaped. */
export function likePattern(q: string): string {
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** PostgREST `or` filter: case-insensitive "contains" over several columns (reserved characters removed). */
export function orIlikeFilter(columns: string[], q: string): string {
  const term = q.replace(/[,()"\\%_*]/g, " ").trim();
  return columns.map((column) => `${column}.ilike.*${term}*`).join(",");
}
