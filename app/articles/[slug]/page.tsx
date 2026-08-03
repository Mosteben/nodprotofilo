import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar } from "lucide-react";
import { ARTICLES } from "@/lib/constants/content";
import { readingTime } from "@/lib/utils";
import { ShareButtons } from "@/components/articles/ShareButtons";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ArticleJsonLd } from "@/components/shared/ArticleJsonLd";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: { images: [article.coverImage] },
  };
}

// يحوّل content (سواء نص واحد أو مصفوفة فقرات) لمصفوفة فقرات موحّدة
function toParagraphs(content: string | string[]): string[] {
  if (Array.isArray(content)) {
    return content.map((p) => p.trim()).filter(Boolean);
  }
  // النصوص اللي فيها سطر فاضي بين الفقرات بتتقسم عليه،
  // ولو مفيش سطر فاضي (زي القصائد) هترجع فقرة واحدة وتتعرض بفواصل الأسطر محفوظة
  return content
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = ARTICLES.find((a) => a.slug === params.slug);
  if (!article) notFound();

  const related = ARTICLES.filter((a) => a.slug !== article.slug && a.category === article.category).slice(0, 3);
  const paragraphs = toParagraphs(article.content);
  const extraImages = article.images ?? [];
  const midpoint = Math.floor(paragraphs.length / 2);

  return (
    <article>
      <ArticleJsonLd article={article} />
      <nav className="container pt-8 text-sm font-ui text-navy/50" aria-label="مسار التصفح">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-gold-dark">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/articles" className="hover:text-gold-dark">المقالات</Link></li>
          <li>/</li>
          <li className="text-navy truncate max-w-[200px]">{article.title}</li>
        </ol>
      </nav>

      <header className="container-narrow text-center pt-10 pb-8">
        <span className="marginalia text-gold-dark mb-4 inline-block">— {article.category}</span>
        <h1 className="font-display text-3xl md:text-5xl text-navy leading-tight mb-6">
          {article.title}
        </h1>
        <div className="flex items-center justify-center gap-6 text-sm text-navy/50 font-ui">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            {new Date(article.publishedAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {readingTime(article.wordCount)} دقائق قراءة
          </span>
        </div>
      </header>

      <div className="container-narrow relative aspect-[16/9] rounded-2xl overflow-hidden mb-12">
        <Image src={article.coverImage} alt={article.title} fill className="object-cover" priority />
      </div>

      <div className="container-narrow prose-content">
        <p className="text-lg leading-loose text-ink/90 mb-8 font-medium">{article.excerpt}</p>

        {paragraphs.map((paragraph, i) => (
          <div key={i}>
            {extraImages[0] && i === midpoint && i > 0 && (
              <div className="relative aspect-[16/9] rounded-2xl overflow-hidden my-10">
                <Image
                  src={extraImages[0]}
                  alt={`صورة تعبيرية من مقالة ${article.title}`}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <p className="text-lg leading-loose text-ink/80 mb-6 whitespace-pre-line">
              {paragraph}
            </p>
          </div>
        ))}

        <div className="flex flex-wrap gap-2 my-8">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs font-ui bg-section text-navy/70 px-3 py-1.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between border-y border-navy/10 py-6 my-10">
          <ShareButtons title={article.title} />
        </div>

        {/* Comments placeholder — to be wired to a moderation-friendly provider */}
        <div className="rounded-2xl bg-section p-8 text-center">
          <p className="font-ui text-navy/60">
            قسم التعليقات قيد التجهيز — سيُتاح للقرّاء قريبًا التفاعل مع كل مقالة.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section-py bg-section mt-20">
          <div className="container">
            <h2 className="font-display text-2xl text-navy mb-8">مقالات ذات صلة</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r, i) => (
                <RevealOnScroll key={r.slug} delay={i * 0.08}>
                  <Link href={`/articles/${r.slug}`} className="group block rounded-2xl overflow-hidden bg-paper shadow-soft">
                    <div className="relative aspect-[16/10]">
                      <Image src={r.coverImage} alt={r.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg text-navy group-hover:text-gold-dark transition-colors">{r.title}</h3>
                    </div>
                  </Link>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}