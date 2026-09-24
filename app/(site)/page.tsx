import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { AboutSection } from "@/components/home/AboutSection";
import { LatestArticles } from "@/components/home/LatestArticles";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { Quote } from "@/components/home/Quote";
import { LatestVideos } from "@/components/home/LatestVideos";
import { FeaturedBook } from "@/components/home/FeaturedBook";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";
import { ContactCta } from "@/components/home/ContactCta";
import { getSiteContent } from "@/lib/data/settings";
import { getPublishedArticles } from "@/lib/data/articles";
import { jsonLdScript } from "@/lib/json-ld";
import { SITE } from "@/lib/constants/site";

export const revalidate = 3600;

export default async function HomePage() {
  const [content, articles] = await Promise.all([getSiteContent(), getPublishedArticles()]);
  const { homepage } = content;
  const show = homepage.sections;
  const sameAs = Object.values(content.social).filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", name: content.siteName, description: content.siteDescription, url: SITE.url, inLanguage: "ar" },
      {
        "@type": "Person",
        name: content.siteName,
        url: SITE.url,
        image: new URL(content.heroImageUrl, SITE.url).toString(),
        sameAs: sameAs.length ? sameAs : undefined,
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <Hero content={content} />
      {show.stats && <Stats articleCount={articles.length} />}
      {show.about && (
        <AboutSection title={content.aboutTitle} description={content.aboutDescription} imageUrl={homepage.aboutImageUrl} />
      )}
      {show.featuredProjects && <FeaturedProjects />}
      {show.latestArticles && <LatestArticles />}
      {show.quote && homepage.quoteText && <Quote text={homepage.quoteText} author={homepage.quoteAuthor} />}
      {show.lectures && <LatestVideos />}
      {show.featuredBook && <FeaturedBook />}
      {show.testimonials && <Testimonials />}
      {show.newsletter && <Newsletter />}
      {show.contact && <ContactCta title={homepage.contactTitle} text={homepage.contactText} email={content.contactEmail} />}
    </>
  );
}
