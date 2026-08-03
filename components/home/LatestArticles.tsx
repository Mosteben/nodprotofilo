import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { ARTICLES } from "@/lib/constants/content";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { readingTime } from "@/lib/utils";

export function LatestArticles() {
  const articles = ARTICLES.slice(0, 3);

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
            href="/articles"
            className="link-underline font-ui text-navy font-medium flex items-center gap-2 mb-12"
          >
            كل المقالات
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {articles.map((article, i) => (
            <RevealOnScroll key={article.slug} delay={i * 0.1}>
              <Link
                href={`/articles/${article.slug}`}
                className="group block rounded-2xl overflow-hidden bg-paper border border-navy/10 hover:border-gold/40 hover:shadow-soft transition-all duration-500"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={article.coverImage}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                  <span className="absolute top-4 right-4 bg-gold text-navy text-xs font-ui font-semibold px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-xl text-navy mb-2 leading-snug group-hover:text-gold-dark transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-brown/80 text-sm leading-relaxed mb-4 line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-navy/50 font-ui">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{readingTime(article.wordCount)} دقائق قراءة</span>
                  </div>
                </div>
              </Link>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
