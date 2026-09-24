import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReadingProgressBar } from "@/components/shared/ReadingProgressBar";
import { BackToTop } from "@/components/shared/BackToTop";
import { WhatsAppButton } from "@/components/shared/WhatsAppButton";
import { getSiteContent } from "@/lib/data/settings";

/** Public-site chrome: navigation, footer and floating buttons around the page content. */
export async function SiteShell({ children }: { children: React.ReactNode }) {
  const content = await getSiteContent();

  return (
    <>
      <ReadingProgressBar />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:bg-navy focus:text-white focus:px-4 focus:py-2 focus:rounded-full"
      >
        تخطَّ إلى المحتوى
      </a>
      <Navbar siteName={content.siteName} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer content={content} />
      <BackToTop />
      {content.social.whatsapp && <WhatsAppButton href={content.social.whatsapp} />}
    </>
  );
}
