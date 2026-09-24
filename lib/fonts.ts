import { Cairo, Tajawal, Aref_Ruqaa, Amiri, Reem_Kufi, Noto_Naskh_Arabic, IBM_Plex_Sans_Arabic } from "next/font/google";

/*
 * Every font the appearance settings can choose from. next/font self-hosts them; only the
 * default trio is preloaded, the alternatives download only when a theme actually uses them.
 * lib/theme.ts maps --font-display / --font-body onto these variables.
 */

const cairo = Cairo({ subsets: ["arabic", "latin"], variable: "--font-cairo", display: "swap" });

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

// Aref Ruqaa: a calligraphic Arabic display face closest to a Diwani feel
// available on Google Fonts. Used only for large headings — never for body copy.
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-aref-ruqaa",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});

const reemKufi = Reem_Kufi({ subsets: ["arabic", "latin"], variable: "--font-reem-kufi", display: "swap", preload: false });

const notoNaskh = Noto_Naskh_Arabic({ subsets: ["arabic"], variable: "--font-noto-naskh", display: "swap", preload: false });

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});

export const fontVariables = [cairo, tajawal, arefRuqaa, amiri, reemKufi, notoNaskh, plexArabic]
  .map((font) => font.variable)
  .join(" ");
