import type { SupabaseClient } from "@supabase/supabase-js";
import type { ArticleRow, Database } from "@/types/database";
import type { ArticleImageInput } from "@/lib/validation";

/**
 * An article's images for the editor, in display order. Falls back to the legacy single
 * cover image when the article has no rows yet (or the article_images migration has not
 * been run), so existing articles never appear image-less.
 */
export async function loadArticleImages(
  supabase: SupabaseClient<Database>,
  article: Pick<ArticleRow, "id" | "cover_image_url">
): Promise<ArticleImageInput[]> {
  const { data, error } = await supabase
    .from("article_images")
    .select("image_url, media_id, storage_path, alt_text")
    .eq("article_id", article.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!error && data.length > 0) return data.map((row) => ({ ...row, alt_text: row.alt_text ?? "" }));
  if (error) console.error("[articles] loading images failed", error.code, error.message);
  return article.cover_image_url
    ? [{ image_url: article.cover_image_url, media_id: null, storage_path: null, alt_text: "" }]
    : [];
}
