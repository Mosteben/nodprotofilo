import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";

/** Empty strings become null so optional columns are stored as NULL. */
export const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `الحد الأقصى ${max} حرفًا.`)
    .transform((v) => v || null);

/** Absolute http(s) URL, a site-relative path ("/images/…"), or empty. */
export const optionalUrl = z
  .string()
  .trim()
  .max(2000, "الرابط طويل جدًا.")
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v) || /^\/[^/\s]/.test(v), "أدخلي رابطًا صحيحًا يبدأ بـ https://")
  .transform((v) => v || null);

export const titleField = z.string().trim().min(1, "العنوان مطلوب.").max(200, "العنوان طويل جدًا.");

/** Whole number in a range, entered as text; empty → null. */
export const optionalInt = (min: number, max: number, message: string) =>
  z
    .union([z.string(), z.number()])
    .transform((v) => String(v).trim())
    .refine((v) => v === "" || (/^\d+$/.test(v) && +v >= min && +v <= max), message)
    .transform((v) => (v === "" ? null : Number(v)));

/** YYYY-MM-DD or empty → null. */
export const optionalDate = z
  .string()
  .trim()
  .refine((v) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v))), "تاريخ غير صالح.")
  .transform((v) => v || null);

export const slugField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "الرابط مطلوب.")
  .max(200, "الرابط طويل جدًا.")
  .regex(SLUG_PATTERN, "استخدمي حروفًا وأرقامًا وشرطات (-) فقط، بدون مسافات.");

/** Rich-text HTML; sanitised again on the server before saving. */
const richTextField = z.string().max(500_000, "المحتوى طويل جدًا.");

/** One article image as sent by the editor (array order = display order). */
export const articleImageSchema = z.object({
  image_url: z
    .string()
    .trim()
    .max(2000, "رابط الصورة طويل جدًا.")
    .refine((v) => /^https?:\/\/[^\s]+$/i.test(v) || /^\/[^/\s]/.test(v), "رابط صورة غير صالح."),
  media_id: z.string().uuid().nullable(),
  storage_path: z.string().trim().max(500).nullable(),
  alt_text: optionalText(300),
});

export type ArticleImageInput = z.input<typeof articleImageSchema>;

export const articleSchema = z.object({
  title: titleField,
  slug: slugField,
  excerpt: optionalText(500),
  content: richTextField,
  images: z.array(articleImageSchema),
  category: optionalText(60),
  tags: z
    .array(z.string().trim().min(1).max(40, "الوسم طويل جدًا."))
    .max(20, "20 وسمًا كحد أقصى."),
  status: z.enum(["draft", "published"]),
  published_at: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "تاريخ غير صالح.")
    .transform((v) => (v ? new Date(v).toISOString() : null)),
});

export type ArticleInput = z.input<typeof articleSchema>;

export const projectSchema = z.object({
  title: titleField,
  slug: slugField,
  description: optionalText(500),
  content: richTextField,
  cover_image_url: optionalUrl,
  category: optionalText(60),
  client: optionalText(120),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1900 && +v <= 2100), "أدخلي سنة صحيحة (مثل 2026).")
    .transform((v) => (v ? Number(v) : null)),
  project_url: optionalUrl,
  github_url: optionalUrl,
  featured: z.boolean(),
  published: z.boolean(),
});

export type ProjectInput = z.input<typeof projectSchema>;
