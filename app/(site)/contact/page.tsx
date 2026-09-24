import type { Metadata } from "next";
import { Mail, MapPin } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { ContactForm } from "@/components/contact/ContactForm";
import { socialLinks } from "@/components/shared/SocialLinks";
import { getPublicProfile, getSiteContent } from "@/lib/data/settings";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "تواصل معي",
  description: "أرسلي رسالة مباشرة أو تواصلي عبر البريد الإلكتروني ومواقع التواصل الاجتماعي.",
  alternates: { canonical: "/contact" },
};

const iconWrap = "h-11 w-11 rounded-full bg-section flex items-center justify-center text-gold-dark shrink-0";

export default async function ContactPage() {
  const [content, profile] = await Promise.all([getSiteContent(), getPublicProfile()]);
  const links = socialLinks(content.social);
  // Once the owner has a profile, its location (even empty) wins over the original text.
  const location = profile ? profile.location : "سمنود-الغربية، جمهورية مصر العربية";

  return (
    <>
      <PageHeader eyebrow="لنتواصل" title="تواصل معي" description="سواء عندك سؤال أو اقتراح — يسعدني تواصلك." />
      <section className="section-py">
        <div className="container grid lg:grid-cols-[1fr_0.8fr] gap-16">
          <div className="relative">
            <h2 className="font-display text-2xl text-navy mb-6">أرسلي رسالة</h2>
            <ContactForm />
          </div>

          <div>
            <h2 className="font-display text-2xl text-navy mb-6">معلومات التواصل</h2>
            <ul className="space-y-4 font-ui text-navy/70">
              {content.contactEmail && (
                <li className="flex items-center gap-3">
                  <span className={iconWrap}>
                    <Mail className="h-5 w-5" />
                  </span>
                  <a href={`mailto:${content.contactEmail}`} className="hover:text-gold-dark" dir="ltr">
                    {content.contactEmail}
                  </a>
                </li>
              )}
              {links.map(({ key, label, icon: Icon, url }) => (
                <li key={key} className="flex items-center gap-3">
                  <span className={iconWrap}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-gold-dark">
                    {label}
                  </a>
                </li>
              ))}
              {location && (
                <li className="flex items-center gap-3">
                  <span className={iconWrap}>
                    <MapPin className="h-5 w-5" />
                  </span>
                  <span>{location}</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
