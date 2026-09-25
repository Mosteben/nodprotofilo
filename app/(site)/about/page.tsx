import type { Metadata } from "next";
import {
  GraduationCap,
  PenTool,
  Target,
  Sparkles,
  BookOpen,
  Heart,
  Briefcase,
  Star,
  MapPin,
  Globe,
  type LucideIcon,
} from "lucide-react";
import type { AboutIcon } from "@/lib/about";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { Timeline } from "@/components/shared/Timeline";
import { CoverImage } from "@/components/shared/CoverImage";
import { socialLinks } from "@/components/shared/SocialLinks";
import { RichText } from "@/components/shared/RichText";
import { toPlainText } from "@/lib/text";
import { getPublicProfile, getSiteContent } from "@/lib/data/settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { aboutTitle, aboutDescription, about } = await getSiteContent();
  return {
    title: "من أنا",
    description: aboutDescription,
    alternates: { canonical: "/about" },
    openGraph: { title: aboutTitle, description: aboutDescription, type: "profile", images: [{ url: about.imageUrl }] },
  };
}

const ICONS: Record<AboutIcon, LucideIcon> = {
  graduation: GraduationCap,
  pen: PenTool,
  target: Target,
  sparkles: Sparkles,
  book: BookOpen,
  heart: Heart,
  briefcase: Briefcase,
  star: Star,
};

function CardList({ items }: { items: { title: string; description: string; label?: string }[] }) {
  return (
    <ul className="grid md:grid-cols-2 gap-6">
      {items.map((item, i) => (
        <li key={`${item.title}-${i}`}>
          <RevealOnScroll delay={(i % 2) * 0.08} className="h-full rounded-2xl border border-navy/10 p-6">
            {item.label && <span className="marginalia text-base">{item.label}</span>}
            <h3 className="font-display text-xl text-navy mb-2">{item.title}</h3>
            {item.description && <p className="text-brown/80 leading-relaxed whitespace-pre-line">{item.description}</p>}
          </RevealOnScroll>
        </li>
      ))}
    </ul>
  );
}

export default async function AboutPage() {
  const [content, profile] = await Promise.all([getSiteContent(), getPublicProfile()]);
  const { about } = content;
  const links = socialLinks(content.social);

  return (
    <>
      <section className="bg-navy-fade text-white section-py">
        <div className="container grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">
          <RevealOnScroll>
            <div className="relative aspect-square max-w-sm mx-auto rounded-full overflow-hidden border-4 border-gold/30">
              <CoverImage src={about.imageUrl} alt={content.siteName} priority sizes="384px" />
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={0.15}>
            <span className="marginalia text-gold-light mb-4 inline-block">— نبذة عني</span>
            <h1 className="font-display text-4xl md:text-5xl mb-6 leading-tight">{content.aboutTitle}</h1>
            <p className="text-white/75 text-lg leading-relaxed max-w-xl whitespace-pre-line">{content.aboutDescription}</p>
            {(profile?.location || profile?.website || links.length > 0) && (
              <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-8 font-ui text-sm text-white/70">
                {profile?.location && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    {profile.location}
                  </li>
                )}
                {profile?.website && (
                  <li>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold">
                      <Globe className="h-4 w-4 text-gold" />
                      الموقع الشخصي
                    </a>
                  </li>
                )}
                {links.map(({ key, label, icon: Icon, url }) => (
                  <li key={key}>
                    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label} className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-gold hover:text-navy transition-colors">
                      <Icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </RevealOnScroll>
        </div>
      </section>

      {toPlainText(about.longBio) && (
        <section className="section-py">
          <div className="container-narrow px-6">
            <RichText value={about.longBio} />
          </div>
        </section>
      )}

      {about.highlights.length > 0 && (
        <section className="section-py">
          <ul className="container grid md:grid-cols-2 gap-12">
            {about.highlights.map((h, i) => {
              const Icon = ICONS[h.icon];
              return (
                <li key={`${h.title}-${i}`}>
                  <RevealOnScroll delay={(i % 2) * 0.1} className="flex items-start gap-4">
                    <Icon className="h-8 w-8 text-gold-dark shrink-0" aria-hidden="true" />
                    <div>
                      <h2 className="font-display text-2xl text-navy mb-2">{h.title}</h2>
                      <p className="text-brown/80 leading-relaxed">{h.text}</p>
                    </div>
                  </RevealOnScroll>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {about.skills.length > 0 && (
        <section className="section-py bg-section">
          <div className="container">
            <SectionHeading eyebrow="المهارات" title="ما الذي أتقنه" />
            <ul className="grid md:grid-cols-2 gap-x-16 gap-y-8 max-w-3xl">
              {about.skills.map((skill, i) => (
                <li key={`${skill.label}-${i}`}>
                  <RevealOnScroll delay={i * 0.08}>
                    <div className="flex items-center justify-between mb-2 font-ui text-sm text-navy">
                      <span>{skill.label}</span>
                      <span className="text-gold-dark font-semibold">{skill.level}٪</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy/10 overflow-hidden" role="meter" aria-label={skill.label} aria-valuenow={skill.level} aria-valuemin={0} aria-valuemax={100}>
                      <div className="h-full rounded-full bg-gold-fade" style={{ width: `${skill.level}%` }} />
                    </div>
                  </RevealOnScroll>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {about.services.length > 0 && (
        <section className="section-py">
          <div className="container">
            <SectionHeading eyebrow="الخدمات" title="كيف يمكنني المساعدة" />
            <CardList items={about.services} />
          </div>
        </section>
      )}

      {about.education.length > 0 && (
        <section className="section-py">
          <div className="container">
            <SectionHeading eyebrow="التعليم" title="المسار الأكاديمي" />
            <CardList items={about.education.map((e) => ({ label: e.period, title: e.title, description: e.description }))} />
          </div>
        </section>
      )}

      {about.timeline.length > 0 && (
        <section className="section-py">
          <div className="container">
            <SectionHeading eyebrow="محطات" title="رحلتي بالتفصيل" />
            <Timeline items={about.timeline} />
          </div>
        </section>
      )}

      {about.achievements.length > 0 && (
        <section className="section-py bg-section">
          <div className="container">
            <SectionHeading eyebrow="إنجازات" title="أعتز بها" />
            <CardList items={about.achievements} />
          </div>
        </section>
      )}
    </>
  );
}
