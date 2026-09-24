import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
import { LECTURES, BOOKS } from "@/lib/constants/content";
import { getPublishedArticles } from "@/lib/data/articles";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  const staticRoutes = ["", "/about", "/blog", "/lectures", "/books", "/resources", "/gallery", "/contact"].map(
    (path) => ({ url: `${SITE.url}${path}`, lastModified: new Date() })
  );

  const articleRoutes = articles.map((a) => ({
    url: `${SITE.url}/blog/${encodeURIComponent(a.slug)}`,
    lastModified: a.updatedAt,
  }));

  const lectureRoutes = LECTURES.map((l) => ({
    url: `${SITE.url}/lectures/${l.slug}`,
    lastModified: l.publishedAt,
  }));

  const bookRoutes = BOOKS.map((b) => ({ url: `${SITE.url}/books/${b.slug}` }));

  return [...staticRoutes, ...articleRoutes, ...lectureRoutes, ...bookRoutes];
}
