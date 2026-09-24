import type { Metadata } from "next";
import { Cairo, Tajawal, Aref_Ruqaa } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/constants/site";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-body",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ui",
  display: "swap",
});

// Aref Ruqaa: a calligraphic Arabic display face closest to a Diwani feel
// available on Google Fonts. Used only for large headings — never for body
// copy — per the brief's typography rule.
const arefRuqaa = Aref_Ruqaa({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: SITE.name,
    locale: SITE.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.name,
    description: SITE.description,
  },
  alternates: {
    canonical: SITE.url,
    types: { "application/rss+xml": `${SITE.url}/rss.xml` },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${tajawal.variable} ${arefRuqaa.variable}`}>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster dir="rtl" position="top-center" richColors closeButton toastOptions={{ className: "font-ui" }} />
      </body>
    </html>
  );
}
