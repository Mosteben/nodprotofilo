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

export const revalidate = 3600;

export default async function HomePage() {
  const content = await getSiteContent();
  const { homepage } = content;
  const show = homepage.sections;

  return (
    <>
      <Hero content={content} />
      {show.stats && <Stats />}
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
