import { SITE } from "@/lib/constants/site";
import type { Article } from "@/types";

export function ArticleJsonLd({ article }: { article: Article }) {
  const json = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    image: [article.coverImage],
    datePublished: article.publishedAt,
    author: {
      "@type": "Person",
      name: SITE.name,
    },
    publisher: {
      "@type": "Person",
      name: SITE.name,
    },
    mainEntityOfPage: `${SITE.url}/articles/${article.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
