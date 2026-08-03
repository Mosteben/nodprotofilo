import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
import { ARTICLES, LECTURES, BOOKS } from "@/lib/constants/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/articles",
    "/lectures",
    "/books",
    "/resources",
    "/gallery",
    "/contact",
  ].map((path) => ({
    url: `${SITE.url}${path}`,
    lastModified: new Date(),
  }));

  const articleRoutes = ARTICLES.map((a) => ({
    url: `${SITE.url}/articles/${a.slug}`,
    lastModified: a.publishedAt,
  }));

  const lectureRoutes = LECTURES.map((l) => ({
    url: `${SITE.url}/lectures/${l.slug}`,
    lastModified: l.publishedAt,
  }));

  const bookRoutes = BOOKS.map((b) => ({
    url: `${SITE.url}/books/${b.slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...articleRoutes, ...lectureRoutes, ...bookRoutes];
}
