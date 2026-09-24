import { z } from "zod";

/**
 * Appearance presets. The owner picks keys from these lists (never raw CSS), so every
 * combination stays readable and on-brand. Colours are "R G B" channels for Tailwind.
 */

type Shades = Record<string, string>;

export const PRIMARY_PALETTES = {
  navy: {
    label: "كحلي",
    swatch: "rgb(11 31 58)",
    vars: { navy: "11 31 58", "navy-50": "234 240 248", "navy-100": "207 220 237", "navy-400": "39 72 112", "navy-600": "18 42 76", "navy-900": "8 20 38" },
  },
  forest: {
    label: "أخضر زيتوني",
    swatch: "rgb(31 59 45)",
    vars: { navy: "31 59 45", "navy-50": "233 235 234", "navy-100": "210 216 213", "navy-400": "76 98 87", "navy-600": "47 73 60", "navy-900": "22 41 32" },
  },
  plum: {
    label: "برقوقي",
    swatch: "rgb(59 31 56)",
    vars: { navy: "59 31 56", "navy-50": "235 233 235", "navy-100": "216 210 215", "navy-400": "98 76 96", "navy-600": "73 47 70", "navy-900": "41 22 39" },
  },
  charcoal: {
    label: "فحمي",
    swatch: "rgb(34 38 43)",
    vars: { navy: "34 38 43", "navy-50": "233 233 234", "navy-100": "211 212 213", "navy-400": "78 81 85", "navy-600": "49 53 58", "navy-900": "24 27 30" },
  },
  teal: {
    label: "أزرق بترولي",
    swatch: "rgb(14 58 67)",
    vars: { navy: "14 58 67", "navy-50": "231 235 236", "navy-100": "207 216 217", "navy-400": "62 97 105", "navy-600": "31 72 80", "navy-900": "10 41 47" },
  },
} satisfies Record<string, { label: string; swatch: string; vars: Shades }>;

export const ACCENT_PALETTES = {
  gold: { label: "ذهبي", swatch: "rgb(212 175 55)", vars: { gold: "212 175 55", "gold-light": "231 202 108", "gold-dark": "169 133 42" } },
  copper: { label: "نحاسي", swatch: "rgb(201 132 82)", vars: { gold: "201 132 82", "gold-light": "217 169 134", "gold-dark": "145 95 59" } },
  rose: { label: "وردي", swatch: "rgb(212 132 143)", vars: { gold: "212 132 143", "gold-light": "225 169 177", "gold-dark": "153 95 103" } },
  sage: { label: "أخضر مريمي", swatch: "rgb(151 184 143)", vars: { gold: "151 184 143", "gold-light": "182 205 177", "gold-dark": "91 110 86" } },
  sky: { label: "سماوي", swatch: "rgb(125 176 210)", vars: { gold: "125 176 210", "gold-light": "164 200 224", "gold-dark": "75 106 126" } },
} satisfies Record<string, { label: string; swatch: string; vars: Shades }>;

export const BACKGROUNDS = {
  white: { label: "أبيض", swatch: "rgb(255 255 255)", vars: { paper: "255 255 255", section: "248 248 248" } },
  ivory: { label: "عاجي", swatch: "rgb(255 253 247)", vars: { paper: "255 253 247", section: "247 243 234" } },
  mist: { label: "رمادي فاتح", swatch: "rgb(250 251 253)", vars: { paper: "250 251 253", section: "239 242 247" } },
} satisfies Record<string, { label: string; swatch: string; vars: Shades }>;

export const TEXT_COLORS = {
  ink: { label: "حبر أسود", swatch: "rgb(17 17 17)", vars: { ink: "17 17 17", brown: "111 78 55", "brown-light": "140 106 78" } },
  slate: { label: "رمادي أردوازي", swatch: "rgb(30 41 59)", vars: { ink: "30 41 59", brown: "71 85 105", "brown-light": "100 116 139" } },
  espresso: { label: "بني قهوة", swatch: "rgb(43 31 23)", vars: { ink: "43 31 23", brown: "120 85 60", "brown-light": "150 115 90" } },
} satisfies Record<string, { label: string; swatch: string; vars: Shades }>;

/** Font keys map to CSS variables created by next/font in app/fonts.ts. */
export const HEADING_FONTS = {
  arefRuqaa: { label: "رقعة (عارف رقعة)", variable: "--font-aref-ruqaa" },
  amiri: { label: "نسخ كلاسيكي (أميري)", variable: "--font-amiri" },
  reemKufi: { label: "كوفي (ريم كوفي)", variable: "--font-reem-kufi" },
  cairo: { label: "حديث (القاهرة)", variable: "--font-cairo" },
} as const;

export const BODY_FONTS = {
  cairo: { label: "القاهرة", variable: "--font-cairo" },
  tajawal: { label: "تجوال", variable: "--font-tajawal" },
  notoNaskh: { label: "نوتو نسخ", variable: "--font-noto-naskh" },
  plexArabic: { label: "IBM Plex عربي", variable: "--font-plex-arabic" },
} as const;

export const BUTTON_STYLES = {
  pill: { label: "دائرية بالكامل", radius: "9999px" },
  rounded: { label: "حواف مستديرة", radius: "0.75rem" },
  square: { label: "حواف حادة", radius: "0.25rem" },
} as const;

export const CARD_RADII = {
  sharp: { label: "حادة", radius: "0.375rem" },
  soft: { label: "ناعمة", radius: "1rem" },
  round: { label: "دائرية", radius: "1.75rem" },
} as const;

const keyOf = <T extends Record<string, unknown>>(options: T, fallback: keyof T & string) =>
  z.enum(Object.keys(options) as [keyof T & string, ...(keyof T & string)[]]).catch(fallback);

/** Unknown or invalid values fall back to the default instead of failing. */
const themeSchema = z.object({
  primary: keyOf(PRIMARY_PALETTES, "navy"),
  accent: keyOf(ACCENT_PALETTES, "gold"),
  background: keyOf(BACKGROUNDS, "white"),
  text: keyOf(TEXT_COLORS, "ink"),
  headingFont: keyOf(HEADING_FONTS, "arefRuqaa"),
  bodyFont: keyOf(BODY_FONTS, "cairo"),
  buttonStyle: keyOf(BUTTON_STYLES, "pill"),
  radius: keyOf(CARD_RADII, "soft"),
});

export type ThemeSettings = z.output<typeof themeSchema>;

export const DEFAULT_THEME: ThemeSettings = themeSchema.parse({});

export function parseTheme(value: unknown): ThemeSettings {
  return themeSchema.parse(value && typeof value === "object" ? value : {});
}

/** CSS custom properties for a theme. Only preset values are emitted — never user input. */
export function themeVars(theme: ThemeSettings): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries({
        ...PRIMARY_PALETTES[theme.primary].vars,
        ...ACCENT_PALETTES[theme.accent].vars,
        ...BACKGROUNDS[theme.background].vars,
        ...TEXT_COLORS[theme.text].vars,
      }).map(([name, value]) => [`--color-${name}`, value])
    ),
    "--font-display": `var(${HEADING_FONTS[theme.headingFont].variable})`,
    "--font-body": `var(${BODY_FONTS[theme.bodyFont].variable})`,
    "--radius-btn": BUTTON_STYLES[theme.buttonStyle].radius,
    "--radius-card": CARD_RADII[theme.radius].radius,
  };
}

export function themeCss(theme: ThemeSettings): string {
  return `:root{${Object.entries(themeVars(theme))
    .map(([k, v]) => `${k}:${v}`)
    .join(";")}}`;
}
