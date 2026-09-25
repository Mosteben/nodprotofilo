import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Calendar } from "lucide-react";
import { getArticleBySlug, getPublishedArticles, pickRelated } from "@/lib/data/articles";
import { decodeSlug } from "@/lib/slug";
import { formatDate } from "@/lib/utils";
import { SITE } from "@/lib/constants/site";
import { ShareButtons } from "@/components/articles/ShareButtons";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { RevealOnScroll } from "@/components/ui/RevealOnScroll";
import { ArticleJsonLd } from "@/components/shared/ArticleJsonLd";
import { CoverImage } from "@/components/shared/CoverImage";
import { Comments } from "@/components/comments/Comments";
import { MasonryGallery } from "@/components/gallery/MasonryGallery";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await getArticleBySlug(decodeSlug((await params).slug));
  if (!article) return { title: "مقالة غير موجودة" };

  const url = `/blog/${article.slug}`;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      tags: article.tags,
      images: article.images.length ? article.images.map((image) => ({ url: image.url, alt: image.alt ?? article.title })) : undefined,
    },
    twitter: {
      card: article.coverImage ? "summary_large_image" : "summary",
      title: article.title,
      description: article.excerpt,
      images: article.images.length ? article.images.map((image) => image.url) : undefined,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const slug = decodeSlug((await params).slug);
  const [article, all] = await Promise.all([getArticleBySlug(slug), getPublishedArticles()]);
  if (!article) notFound();

  const related = pickRelated(all, article);
  const url = `${SITE.url}/blog/${article.slug}`;

  return (
    <article>
      <ArticleJsonLd article={article} url={url} />
      <nav className="container pt-8 text-sm font-ui text-navy/50" aria-label="مسار التصفح">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-gold-dark">الرئيسية</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/blog" className="hover:text-gold-dark">المقالات</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-navy truncate max-w-[200px]" aria-current="page">{article.title}</li>
        </ol>
      </nav>

      <header className="container-narrow text-center pt-10 pb-8 px-6">
        {article.category && (
          <span className="marginalia text-gold-dark mb-4 inline-block">— {article.category}</span>
        )}
        <h1 className="font-display text-3xl md:text-5xl text-navy leading-tight mb-6">{article.title}</h1>
        <div className="flex items-center justify-center gap-6 text-sm text-navy/50 font-ui">
          <span className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {article.readingMinutes} دقائق قراءة
          </span>
        </div>
      </header>

      {article.coverImage && (
        <div className="container-narrow px-6">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12">
            <CoverImage src={article.coverImage} alt={article.images[0]?.alt ?? article.title} priority sizes="(min-width: 768px) 768px, 100vw" />
          </div>
        </div>
      )}

      <div className="container-narrow px-6">
        {article.excerpt && (
          <p className="text-lg leading-loose text-ink/90 mb-8 font-medium">{article.excerpt}</p>
        )}

        {/* Sanitised on save and again when read (lib/sanitize.ts). */}
        <div className="rich-content" dangerouslySetInnerHTML={{ __html: article.contentHtml }} />

        {/* Article images (separate from images inside the text); only when there is more than one. */}
        {article.images.length > 1 && (
          <section className="my-12" aria-labelledby="article-images-heading">
            <h2 id="article-images-heading" className="font-display text-2xl text-navy mb-6">
              صور المقالة
            </h2>
            <MasonryGallery
              images={article.images.map((image, i) => ({
                id: `${article.id}-${i}`,
                src: image.url,
                alt: image.alt ?? `${article.title} — صورة ${i + 1}`,
                title: null,
                caption: image.alt,
                category: null,
              }))}
            />
          </section>
        )}

        {article.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 my-8" aria-label="الوسوم">
            {article.tags.map((tag) => (
              <li key={tag} className="text-xs font-ui bg-section text-navy/70 px-3 py-1.5 rounded-full">
                #{tag}
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-y border-navy/10 py-6 my-10">
          <ShareButtons title={article.title} url={url} />
        </div>
      </div>

      <Comments contentType="article" contentId={article.id} />

      {related.length > 0 && (
        <section className="section-py" aria-labelledby="related-heading">
          <div className="container">
            <h2 id="related-heading" className="font-display text-2xl text-navy mb-8">مقالات ذات صلة</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {related.map((r, i) => (
                <RevealOnScroll key={r.slug} delay={i * 0.08}>
                  <ArticleCard article={r} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
