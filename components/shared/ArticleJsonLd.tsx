import { SITE } from "@/lib/constants/site";
import type { ArticleSummary } from "@/lib/data/articles";

/** Serialises JSON-LD safely inside a <script> tag (escapes "<" to prevent breaking out). */
export function jsonLdScript(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

export function ArticleJsonLd({ article, url }: { article: ArticleSummary; url: string }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.tags.join(", ") || undefined,
    author: { "@type": "Person", name: SITE.name },
    publisher: { "@type": "Person", name: SITE.name },
    mainEntityOfPage: url,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(json)} />;
}
