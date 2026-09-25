"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { HOMEPAGE_SECTIONS, type HomepageSection } from "@/lib/site-settings";
import { ABOUT_ICONS, type AboutIcon } from "@/lib/about";
import { sanitizeRichText } from "@/lib/sanitize";
import {
  ACCENT_PALETTES,
  BACKGROUNDS,
  BODY_FONTS,
  BUTTON_STYLES,
  CARD_RADII,
  HEADING_FONTS,
  PRIMARY_PALETTES,
  TEXT_COLORS,
} from "@/lib/theme";
import { optionalText, optionalUrl } from "@/lib/validation";
import type { Database } from "@/types/database";
import { fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

type SettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

const text = (max: number) => z.string().trim().max(max, `الحد الأقصى ${max} حرفًا.`);

/** Link targets: site paths ("/blog") or absolute http(s) URLs. */
const linkTarget = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^\/(?!\/)/.test(v) || /^https?:\/\/[^\s]+$/i.test(v), "استخدمي مسارًا يبدأ بـ / أو رابطًا يبدأ بـ https://");

/** Social URL; "" means "hide this network" (stored as "", unlike NULL = default). */
const socialUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "أدخلي رابطًا كاملًا يبدأ بـ https://");

async function saveSettings(values: SettingsUpdate): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error } = await supabase.from("site_settings").upsert({ id: 1, ...values });
    if (error) return fromDbError(error);
    revalidateTag(CACHE_TAGS.settings);
    return ok(null);
  });
}

// --- Homepage content --------------------------------------------------------

const homepageInputSchema = z.object({
  hero_title: text(200).min(1, "عنوان القسم الرئيسي مطلوب."),
  hero_description: text(1000),
  hero_image_url: optionalUrl,
  homepage: z.object({
    heroEyebrow: text(120),
    heroBadge: text(120),
    heroButtonText: text(60),
    heroButtonUrl: linkTarget,
    heroSecondaryButtonText: text(60),
    heroSecondaryButtonUrl: linkTarget,
    quoteText: text(1000),
    quoteAuthor: text(120),
    contactTitle: text(120),
    contactText: text(500),
    sections: z.object(
      Object.fromEntries(Object.keys(HOMEPAGE_SECTIONS).map((k) => [k, z.boolean()])) as Record<HomepageSection, z.ZodBoolean>
    ),
  }),
});

export type HomepageInput = z.input<typeof homepageInputSchema>;

export async function saveHomepageContent(input: HomepageInput): Promise<ActionResult> {
  const parsed = homepageInputSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  return saveSettings(parsed.data);
}

// --- Theme -------------------------------------------------------------------

const oneOf = <T extends Record<string, unknown>>(options: T) =>
  z.enum(Object.keys(options) as [keyof T & string, ...(keyof T & string)[]], "اختيار غير صالح.");

const themeInputSchema = z.object({
  primary: oneOf(PRIMARY_PALETTES),
  accent: oneOf(ACCENT_PALETTES),
  background: oneOf(BACKGROUNDS),
  text: oneOf(TEXT_COLORS),
  headingFont: oneOf(HEADING_FONTS),
  bodyFont: oneOf(BODY_FONTS),
  buttonStyle: oneOf(BUTTON_STYLES),
  radius: oneOf(CARD_RADII),
});

export type ThemeInput = z.input<typeof themeInputSchema>;

export async function saveTheme(input: ThemeInput): Promise<ActionResult> {
  const parsed = themeInputSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  return saveSettings({ theme_settings: parsed.data });
}

// --- General settings --------------------------------------------------------

const generalInputSchema = z.object({
  site_name: text(120).min(1, "اسم الموقع مطلوب."),
  site_description: text(500),
  contact_email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, "بريد إلكتروني غير صالح.")
    .transform((v) => v || null),
  facebook_url: socialUrl,
  youtube_url: socialUrl,
  whatsapp_url: socialUrl,
  instagram_url: socialUrl,
  linkedin_url: socialUrl,
  github_url: socialUrl,
  behance_url: socialUrl,
});

export type GeneralSettingsInput = z.input<typeof generalInputSchema>;

export async function saveGeneralSettings(input: GeneralSettingsInput): Promise<ActionResult> {
  const parsed = generalInputSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  return saveSettings(parsed.data);
}

// --- Profile -----------------------------------------------------------------

const profileInputSchema = z.object({
  name: optionalText(120),
  bio: optionalText(2000),
  avatar_url: optionalUrl,
  email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, "بريد إلكتروني غير صالح.")
    .transform((v) => v || null),
  phone: optionalText(40),
  location: optionalText(120),
  website: optionalUrl,
});

export type ProfileInput = z.input<typeof profileInputSchema>;

/** Updates the signed-in admin's own profile. */
export async function saveProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  return withAdmin(async ({ supabase, user }) => {
    const { error } = await supabase.from("profiles").update(parsed.data).eq("user_id", user.id);
    if (error) return fromDbError(error);
    revalidateTag(CACHE_TAGS.settings);
    return ok(null);
  });
}

// --- About page --------------------------------------------------------------

const item = <S extends z.ZodRawShape>(shape: S) => z.array(z.object(shape)).max(40, "40 عنصرًا كحد أقصى.");

const aboutInputSchema = z.object({
  about_title: text(200),
  about_description: text(3000),
  about: z.object({
    imageUrl: optionalUrl.transform((v) => v ?? ""),
    longBio: z.string().max(50000, "السيرة طويلة جدًا.").transform((v) => sanitizeRichText(v).trim()),
    highlights: item({ icon: z.enum(Object.keys(ABOUT_ICONS) as [AboutIcon, ...AboutIcon[]]), title: text(120).min(1, "العنوان مطلوب."), text: text(1000) }),
    skills: item({ label: text(120).min(1, "اسم المهارة مطلوب."), level: z.number().int().min(0).max(100) }),
    timeline: item({ year: text(40), title: text(160).min(1, "العنوان مطلوب."), description: text(1000) }),
    education: item({ period: text(60), title: text(160).min(1, "العنوان مطلوب."), description: text(1000) }),
    achievements: item({ title: text(160).min(1, "العنوان مطلوب."), description: text(1000) }),
    services: item({ title: text(160).min(1, "العنوان مطلوب."), description: text(1000) }),
  }),
});

export type AboutInput = z.input<typeof aboutInputSchema>;

export async function saveAboutContent(input: AboutInput): Promise<ActionResult> {
  const parsed = aboutInputSchema.safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);
  return saveSettings(parsed.data);
}
