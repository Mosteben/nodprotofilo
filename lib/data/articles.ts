import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { sanitizeRichText } from "@/lib/sanitize";
import { countWords, htmlToText } from "@/lib/text";
import { readingTime } from "@/lib/utils";
import type { ArticleRow } from "@/types/database";

export type ArticleSummary = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  category: string | null;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
};

export type ArticleDetail = ArticleSummary & { contentHtml: string };

const cacheOptions = { tags: [CACHE_TAGS.articles], revalidate: PUBLIC_REVALIDATE_SECONDS };

function toSummary(row: ArticleRow): ArticleSummary {
  const text = htmlToText(row.content);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || text.slice(0, 180),
    coverImage: row.cover_image_url,
    category: row.category,
    tags: row.tags,
    publishedAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
    readingMinutes: readingTime(countWords(text)),
  };
}

const fetchPublishedArticles = unstable_cache(
  async (): Promise<ArticleSummary[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw new Error(`articles: ${error.message}`);
    return data.map(toSummary);
  },
  ["published-articles"],
  cacheOptions
);

/**
 * All published articles, newest first. Returns [] if the database is unreachable so
 * listing pages render an empty state instead of failing (the failure is not cached).
 */
export async function getPublishedArticles(): Promise<ArticleSummary[]> {
  try {
    return await fetchPublishedArticles();
  } catch (error) {
    console.error("[data] failed to load articles", error);
    return [];
  }
}

/** One published article by slug, or null. Throws if the database is unreachable. */
export const getArticleBySlug = unstable_cache(
  async (slug: string): Promise<ArticleDetail | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`article: ${error.message}`);
    if (!data) return null;
    return { ...toSummary(data), contentHtml: sanitizeRichText(data.content) };
  },
  ["article-by-slug"],
  cacheOptions
);

/** Same category first, then the most recent others. */
export function pickRelated(all: ArticleSummary[], current: ArticleSummary, limit = 3): ArticleSummary[] {
  const others = all.filter((a) => a.slug !== current.slug);
  const sameCategory = others.filter((a) => current.category && a.category === current.category);
  const rest = others.filter((a) => !sameCategory.includes(a));
  return [...sameCategory, ...rest].slice(0, limit);
}
