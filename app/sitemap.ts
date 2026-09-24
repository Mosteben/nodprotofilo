import type { MetadataRoute } from "next";
import { SITE } from "@/lib/constants/site";
import { getPublishedBooks, getPublishedLectures } from "@/lib/data/collections";
import { getPublishedArticles } from "@/lib/data/articles";
import { getPublishedProjects } from "@/lib/data/projects";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects, books, lectures] = await Promise.all([
    getPublishedArticles(),
    getPublishedProjects(),
    getPublishedBooks(),
    getPublishedLectures(),
  ]);

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

  const lectureRoutes = lectures.map((l) => ({
    url: `${SITE.url}/lectures/${encodeURIComponent(l.slug)}`,
    lastModified: l.updated_at,
  }));

  const bookRoutes = books.map((b) => ({ url: `${SITE.url}/books/${encodeURIComponent(b.slug)}`, lastModified: b.updated_at }));

  return [...staticRoutes, ...articleRoutes, ...projectRoutes, ...lectureRoutes, ...bookRoutes];
}
