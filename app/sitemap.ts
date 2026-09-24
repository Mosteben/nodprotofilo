import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
import { LECTURES } from "@/lib/constants/content";
import { getPublishedBooks } from "@/lib/data/collections";
import { getPublishedArticles } from "@/lib/data/articles";
import { getPublishedProjects } from "@/lib/data/projects";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects, books] = await Promise.all([getPublishedArticles(), getPublishedProjects(), getPublishedBooks()]);

  const staticRoutes = ["", "/about", "/blog", "/portfolio", "/lectures", "/books", "/resources", "/gallery", "/contact"].map(
    (path) => ({ url: `${SITE.url}${path}`, lastModified: new Date() })
  );

  const articleRoutes = articles.map((a) => ({
    url: `${SITE.url}/blog/${encodeURIComponent(a.slug)}`,
    lastModified: a.updatedAt,
  }));

  const projectRoutes = projects.map((p) => ({
    url: `${SITE.url}/portfolio/${encodeURIComponent(p.slug)}`,
    lastModified: p.updatedAt,
  }));

  const lectureRoutes = LECTURES.map((l) => ({
    url: `${SITE.url}/lectures/${l.slug}`,
    lastModified: l.publishedAt,
  }));

  const bookRoutes = books.map((b) => ({ url: `${SITE.url}/books/${encodeURIComponent(b.slug)}`, lastModified: b.updated_at }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes, ...lectureRoutes, ...bookRoutes];
}
