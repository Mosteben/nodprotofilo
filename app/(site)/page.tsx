import { Hero } from "@/components/home/Hero";
import { Stats } from "@/components/home/Stats";
import { LatestArticles } from "@/components/home/LatestArticles";
import { Quote } from "@/components/home/Quote";
import { LatestVideos } from "@/components/home/LatestVideos";
import { FeaturedBook } from "@/components/home/FeaturedBook";
import { Testimonials } from "@/components/home/Testimonials";
import { Newsletter } from "@/components/home/Newsletter";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Stats />
      <LatestArticles />
      <Quote />
      <LatestVideos />
      <FeaturedBook />
      <Testimonials />
      <Newsletter />
    </>
  );
}
