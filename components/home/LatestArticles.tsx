import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishedArticles } from "@/lib/data/articles";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ArticleCard } from "@/components/articles/ArticleCard";

export async function LatestArticles() {
  const articles = (await getPublishedArticles()).slice(0, 3);
  if (articles.length === 0) return null;

  return (
    <section className="section-py">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="من المدونة"
            title="أحدث المقالات"
            description="أفكار ومشاهدات من رحلتي بين الدراسة والكتابة."
          />
          <Link
            href="/blog"
            className="link-underline font-ui text-navy font-medium flex items-center gap-2 mb-12"
          >
            كل المقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <RevealOnScroll key={article.slug} delay={i * 0.1} className="h-full">
              <ArticleCard article={article} />
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
