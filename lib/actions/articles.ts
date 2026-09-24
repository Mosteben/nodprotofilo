"use server";

import { revalidateTag } from "next/cache";
import { articleSchema, type ArticleInput } from "@/lib/validation";
import { sanitizeRichText } from "@/lib/sanitize";
import { CACHE_TAGS } from "@/lib/cache-tags";
import type { ContentStatus } from "@/types/database";
import { fail, fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

type Saved = { id: string; slug: string; status: ContentStatus };

/** Creates an article (id = null) or updates an existing one. */
export async function saveArticle(id: string | null, input: ArticleInput): Promise<ActionResult<Saved>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = articleSchema.safeParse(input);
    if (!parsed.success) return fromZodError(parsed.error);

    const values = { ...parsed.data, content: sanitizeRichText(parsed.data.content) };
    const { data, error } = await (id
      ? supabase.from("articles").update(values).eq("id", id)
      : supabase.from("articles").insert(values)
    )
      .select("id, slug, status")
      .single();

    if (error) return fromDbError(error);
    revalidateTag(CACHE_TAGS.articles);
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
