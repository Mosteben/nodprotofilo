import Link from "next/link";
import { Facebook, Youtube, Mail, PenLine } from "lucide-react";
import { NAV_LINKS, SITE } from "@/lib/constants/site";

export function Footer() {
  return (
    <footer className="bg-navy text-white mt-24">
      <div className="container py-16 grid gap-12 md:grid-cols-3">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <PenLine className="h-6 w-6 text-gold" />
            <span className="font-display text-2xl">{SITE.name}</span>
          </Link>
          <p className="text-white/70 leading-relaxed max-w-sm">
            {SITE.description}
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl text-gold mb-4">خريطة الموقع</h3>
          <ul className="grid grid-cols-2 gap-2 text-white/70 font-ui text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-gold mb-4">تابعيني</h3>
          <div className="flex gap-3">
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="فيسبوك"
              className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-navy transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href={SITE.youtube}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="يوتيوب"
              className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-navy transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
            <a
              href={`mailto:${SITE.email}`}
              aria-label="بريد إلكتروني"
              className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-navy transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-white/50 font-ui">
          <p>© {new Date().getFullYear()} {SITE.name}. جميع الحقوق محفوظة.</p>
          <p>صُنع بشغف لتبسيط العلم ونشر المعرفة</p>
        </div>
      </div>
    </footer>
  );
}
