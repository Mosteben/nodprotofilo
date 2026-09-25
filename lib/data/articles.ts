import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { sanitizeRichText } from "@/lib/sanitize";
import { countWords, htmlToText } from "@/lib/text";
import { readingTime } from "@/lib/utils";
import type { ArticleRow, Database } from "@/types/database";

export type ArticleImage = { url: string; alt: string | null };

export type ArticleSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  /** Primary image (images[0]); used wherever one image is shown. */
  coverImage: string | null;
  /** All article images in display order. */
  images: ArticleImage[];
  category: string | null;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
};

export type ArticleDetail = ArticleSummary & { contentHtml: string };

const cacheOptions = { tags: [CACHE_TAGS.articles], revalidate: PUBLIC_REVALIDATE_SECONDS };

function toSummary(row: ArticleRow, stored: ArticleImage[] = []): ArticleSummary {
  const text = htmlToText(row.content);
  // Articles without image rows (or before the article_images migration) keep their single cover.
  const images = stored.length > 0 ? stored : row.cover_image_url ? [{ url: row.cover_image_url, alt: null }] : [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || text.slice(0, 180),
    coverImage: images[0]?.url ?? null,
    images,
    category: row.category,
    tags: row.tags,
    publishedAt: row.published_at ?? row.created_at,
    updatedAt: row.updated_at,
    readingMinutes: readingTime(countWords(text)),
  };
}

/**
 * Images of the given articles, grouped by article in display order. Returns an empty map
 * if the lookup fails (e.g. the article_images migration has not been run yet), so pages
 * fall back to each article's single cover image instead of failing.
 */
async function imagesFor(supabase: SupabaseClient<Database>, ids: string[]): Promise<Map<string, ArticleImage[]>> {
  const byArticle = new Map<string, ArticleImage[]>();
  if (ids.length === 0) return byArticle;
  const { data, error } = await supabase
    .from("article_images")
    .select("article_id, image_url, alt_text")
    .in("article_id", ids)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[data] article images unavailable, using cover images", error.code, error.message);
    return byArticle;
  }
  for (const row of data) {
    const list = byArticle.get(row.article_id) ?? [];
    list.push({ url: row.image_url, alt: row.alt_text });
    byArticle.set(row.article_id, list);
  }
  return byArticle;
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
    const images = await imagesFor(supabase, data.map((a) => a.id));
    return data.map((row) => toSummary(row, images.get(row.id)));
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
    const images = await imagesFor(supabase, [data.id]);
    return { ...toSummary(data, images.get(data.id)), contentHtml: sanitizeRichText(data.content) };
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
