"use server";

import { revalidateTag } from "next/cache";
import { articleSchema, type ArticleInput } from "@/lib/validation";
import { sanitizeRichText } from "@/lib/sanitize";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ContentStatus } from "@/types/database";
import { fail, fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

type Saved = {
  id: string;
  slug: string;
  status: ContentStatus;
  /** Set when the article was saved but its image list could not be. */
  imagesError?: string;
};

/**
 * Creates an article (id = null) or updates an existing one, then replaces its ordered
 * image list atomically (set_article_images also mirrors image #1 into cover_image_url).
 */
export async function saveArticle(id: string | null, input: ArticleInput): Promise<ActionResult<Saved>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success) return fromZodError(parsed.error);

    const { images, ...fields } = parsed.data;
    const values = {
      ...fields,
      content: sanitizeRichText(fields.content),
      // Kept in step with the primary image for every single-image consumer.
      cover_image_url: images[0]?.image_url ?? null,
    };
    const { data, error } = await (id
      ? supabase.from("articles").update(values).eq("id", id)
      : supabase.from("articles").insert(values)
    )
      .select("id, slug, status")
      .single();
    if (error) return fromDbError(error);

    const { error: imagesError } = await supabase.rpc("set_article_images", {
      p_article_id: data.id,
      p_images: images,
    });
    revalidateTag(CACHE_TAGS.articles);

    if (imagesError) {
      console.error("[articles] saving images failed", imagesError.code, imagesError.message);
      const missing = imagesError.code === "PGRST202" || imagesError.code === "42883";
      return ok({
        ...data,
        imagesError: missing
          ? "تم حفظ المقالة، لكن صور المقالة لم تُحفظ: شغّلي ترحيل قاعدة البيانات 20260927000000_article_images.sql."
          : "تم حفظ المقالة، لكن تعذّر حفظ قائمة الصور. حاولي الحفظ مرة أخرى.",
      });
    }
    return ok(data);
  });
}

export async function setArticleStatus(id: string, status: ContentStatus): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase
      .from("articles")
      .update({ status }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("المقالة غير موجودة.");
    revalidateTag(CACHE_TAGS.articles);
    return ok(null);
  });
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase.from("articles").delete({ count: "exact" }).eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("المقالة غير موجودة أو حُذفت بالفعل.");
    await supabase.from("comments").delete().eq("content_type", "article").eq("content_id", id);
    revalidateTag(CACHE_TAGS.articles);
    return ok(null);
  });
}
