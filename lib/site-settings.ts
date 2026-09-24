import { z } from "zod";
import { SITE } from "@/lib/constants/site";
import { DEFAULT_THEME, parseTheme, type ThemeSettings } from "@/lib/theme";
import { parseAbout, type AboutContent } from "@/lib/about";
import type { SiteSettingsRow } from "@/types/database";

/** Homepage sections the owner can show or hide, in display order. */
export const HOMEPAGE_SECTIONS = {
  stats: "الأرقام والإحصاءات",
  about: "نبذة عني",
  featuredProjects: "المشاريع المميّزة",
  latestArticles: "أحدث المقالات",
  quote: "الاقتباس",
  lectures: "أحدث المحاضرات",
  featuredBook: "الكتاب المميّز",
  testimonials: "آراء القرّاء",
  newsletter: "النشرة البريدية",
  contact: "دعوة للتواصل",
} as const;

export type HomepageSection = keyof typeof HOMEPAGE_SECTIONS;

const text = (fallback: string, max: number) => z.string().max(max).catch(fallback);
/** Sections are visible unless explicitly hidden. */
const shown = z.boolean().catch(true);

/** Extra homepage content stored in site_settings.homepage (JSONB). Defaults = original site. */
const homepageSchema = z.object({
  heroEyebrow: text("طالبة تربية · كاتبة", 120),
  heroBadge: text("الكتابة أعمق طرق الفهم", 120),
  heroButtonText: text("اقرأ المقالات", 60),
  heroButtonUrl: text("/blog", 500),
  heroSecondaryButtonText: text("شاهد المحاضرات", 60),
  heroSecondaryButtonUrl: text("/lectures", 500),
  quoteText: text(
    "يَجُوبُ العقلُ بُحورَ العَوالمِ أجمعَ\nويَتفننُ في تساؤلاتِه المَطرُوحة\nحَتى يُسكِر من نَبيذ الحياة\nويضيعُ بينَ يَقينٍ ووهنٍ عابرٍ\nفلا القلبُ يدرِي ما العِلّةُ\nولا الرُوح تُسكِّنُ المُصاب",
    1000
  ),
  quoteAuthor: text(SITE.name, 120),
  contactTitle: text("لنبقَ على تواصل", 120),
  contactText: text("سواء عندك سؤال أو اقتراح أو فكرة تعاون — يسعدني أن أسمع منك.", 500),
  sections: z.preprocess(
    (v) => (v && typeof v === "object" ? v : {}),
    z.object({
      stats: shown,
      about: shown,
      featuredProjects: shown,
      latestArticles: shown,
      quote: shown,
      lectures: shown,
      featuredBook: shown,
      testimonials: shown,
      newsletter: shown,
      contact: shown,
    } satisfies Record<HomepageSection, typeof shown>)
  ),
});

export type HomepageContent = z.output<typeof homepageSchema>;

function parseHomepage(value: unknown): HomepageContent {
  return homepageSchema.parse(value && typeof value === "object" ? value : {});
}

/** Effective site settings: database values where set, original site content otherwise. */
export type SiteContent = {
  siteName: string;
  siteDescription: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl: string;
  aboutTitle: string;
  aboutDescription: string;
  contactEmail: string;
  social: {
    facebook: string;
    youtube: string;
    whatsapp: string;
    instagram: string;
    linkedin: string;
    github: string;
    behance: string;
  };
  homepage: HomepageContent;
  about: AboutContent;
  theme: ThemeSettings;
};

export const DEFAULT_SITE_CONTENT: SiteContent = {
  siteName: SITE.name,
  siteDescription: SITE.description,
  heroTitle: "أكتب عن ما أحلم\nبلغة تصل للقلب",
  heroDescription: `${SITE.name}، ${SITE.role}. أشارك هنا مقالاتي ومحاضراتي وموادي التعليمية، محاولةً أن أجعل كل فكرة علمية معقّدة في متناول كل قارئ.`,
  heroImageUrl: "/images/profile/profile.jpeg",
  aboutTitle: `مرحبًا، أنا ${SITE.name}`,
  aboutDescription: `${SITE.role}، أؤمن أن العلم يستحق أن يُروى بلغة بسيطة تصل لكل عقل. أكتب لأفهم أكثر، وأشارك ما أتعلّمه مع كل من يبحث عن نفس الطريق.`,
  contactEmail: SITE.email,
  social: {
    facebook: SITE.facebook,
    youtube: SITE.youtube,
    whatsapp: SITE.whatsapp,
    instagram: "",
    linkedin: "",
    github: "",
    behance: "",
  },
  homepage: parseHomepage({}),
  about: parseAbout({}),
  theme: DEFAULT_THEME,
};

const pick = (value: string | null | undefined, fallback: string) => (value && value.trim() ? value : fallback);

export function toSiteContent(row: SiteSettingsRow | null): SiteContent {
  if (!row) return DEFAULT_SITE_CONTENT;
  const d = DEFAULT_SITE_CONTENT;
  return {
    siteName: pick(row.site_name, d.siteName),
    siteDescription: pick(row.site_description, d.siteDescription),
    heroTitle: pick(row.hero_title, d.heroTitle),
    heroDescription: pick(row.hero_description, d.heroDescription),
    heroImageUrl: pick(row.hero_image_url, d.heroImageUrl),
    aboutTitle: pick(row.about_title, d.aboutTitle),
    aboutDescription: pick(row.about_description, d.aboutDescription),
    contactEmail: pick(row.contact_email, d.contactEmail),
    // Social links: null = never set (use default); "" = deliberately removed.
    social: {
      facebook: row.facebook_url ?? d.social.facebook,
      youtube: row.youtube_url ?? d.social.youtube,
      whatsapp: row.whatsapp_url ?? d.social.whatsapp,
      instagram: row.instagram_url ?? "",
      linkedin: row.linkedin_url ?? "",
      github: row.github_url ?? "",
      behance: row.behance_url ?? "",
    },
    homepage: parseHomepage(row.homepage),
    // The About image used to live in the homepage settings; still honoured as a fallback.
    about: parseAbout(row.about, (row.homepage as { aboutImageUrl?: unknown } | null)?.aboutImageUrl),
    theme: parseTheme(row.theme_settings),
  };
}
