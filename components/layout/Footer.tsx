import Link from "next/link";
import { Mail, PenLine } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants/site";
import type { SiteContent } from "@/lib/site-settings";
import { socialLinks } from "@/components/shared/SocialLinks";

const iconLink =
  "h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-navy transition-colors";

export function Footer({ content }: { content: SiteContent }) {
  const links = socialLinks(content.social).filter((l) => l.key !== "whatsapp");

  return (
    <footer className="bg-navy text-white mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <PenLine className="h-6 w-6 text-gold" />
            <span className="font-display text-2xl">{content.siteName}</span>
          </Link>
          <p className="text-white/70 leading-relaxed max-w-sm">{content.siteDescription}</p>
        </div>

        <nav aria-label="خريطة الموقع">
          <h2 className="font-display text-xl text-gold mb-4">خريطة الموقع</h2>
          <ul className="grid grid-cols-2 gap-2 text-white/70 font-ui text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-xl text-gold mb-4">تابعيني</h2>
          <div className="flex flex-wrap gap-3">
            {links.map(({ key, label, icon: Icon, url }) => (
              <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className={iconLink}>
                <Icon className="h-5 w-5" />
              </a>
            ))}
            {content.contactEmail && (
              <a href={`mailto:${content.contactEmail}`} aria-label="بريد إلكتروني" className={iconLink}>
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-white/50 font-ui">
          <p>© {new Date().getFullYear()} {content.siteName}. جميع الحقوق محفوظة.</p>
          <p>صُنع بشغف لتبسيط العلم ونشر المعرفة</p>
        </div>
      </div>
    </footer>
  );
}
