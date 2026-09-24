import type { Stat } from "@/types";

export const STATS: Stat[] = [
  { label: "مقالة منشورة", value: 42 },
  { label: "محاضرة تعليمية", value: 26 },
  { label: "طالب وقارئ", value: 3200, suffix: "+" },
  { label: "مصدر تعليمي مجاني", value: 58 },
];

// Articles, projects, books, lectures, resources and the gallery live in Supabase.
