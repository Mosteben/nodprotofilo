import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";
import { SITE } from "@/lib/constants/site";
import { fontVariables } from "@/lib/fonts";
import { themeCss } from "@/lib/theme";
import { getSiteContent } from "@/lib/data/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { siteName, siteDescription, heroImageUrl } = await getSiteContent();
  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: `${siteName} | ${SITE.tagline}`,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    openGraph: {
      title: siteName,
      description: siteDescription,
      url: SITE.url,
      siteName,
      locale: SITE.locale,
      type: "website",
      images: [{ url: heroImageUrl, alt: siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteDescription,
    },
    alternates: {
      canonical: "/",
      types: { "application/rss+xml": `${SITE.url}/rss.xml` },
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = await getSiteContent();

  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <head>
        {/* Appearance settings → CSS variables (preset values only, see lib/theme.ts). */}
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {children}
        <Toaster dir="rtl" position="top-center" richColors closeButton toastOptions={{ className: "font-ui" }} />
      </body>
    </html>
  );
}
