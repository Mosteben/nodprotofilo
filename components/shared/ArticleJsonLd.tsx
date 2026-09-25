import { SITE } from "@/lib/constants/site";
import type { ArticleSummary } from "@/lib/data/articles";
import { jsonLdScript } from "@/lib/json-ld";

export function ArticleJsonLd({ article, url }: { article: ArticleSummary; url: string }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.images.length ? article.images.map((image) => image.url) : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    keywords: article.tags.join(", ") || undefined,
    author: { "@type": "Person", name: SITE.name },
    publisher: { "@type": "Person", name: SITE.name },
    mainEntityOfPage: url,
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(json)} />;
}
