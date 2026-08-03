import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatArabicNumber(n: number): string {
  return new Intl.NumberFormat("ar-EG").format(n);
}

export function readingTime(wordCount: number): number {
  return Math.max(1, Math.round(wordCount / 180));
}
