"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import type { SupabaseClient } from "@supabase/supabase-js";
import { COLLECTIONS, isCollectionKey, type CollectionKey } from "@/lib/collections";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { RESOURCES_BUCKET, RESOURCE_PATH_PATTERN, MAX_RESOURCE_BYTES, isResourceType } from "@/lib/resource-files";
import { parseYouTubeId } from "@/lib/youtube";
import { sanitizeRichText } from "@/lib/sanitize";
import { optionalDate, optionalInt, optionalText, optionalUrl, slugField, titleField } from "@/lib/validation";
import type { CommentContentType } from "@/types/database";
import { fail, fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

const flag = z.boolean();

/** Editor HTML: sanitised with the rich-text allow-list; empty → null. */
const richText = z
  .string()
  .max(20000, "النص طويل جدًا.")
  .transform((v) => sanitizeRichText(v).trim() || null);

const youtubeField = z
  .string()
  .trim()
  .refine((v) => v === "" || parseYouTubeId(v) !== null, "رابط يوتيوب غير صالح.")
  .transform((v) => (v ? parseYouTubeId(v) : null));

const SCHEMAS = {
  gallery: z.object({
    image_url: z.string().trim().min(1, "اختاري صورة.").pipe(optionalUrl),
    title: optionalText(200),
    caption: optionalText(1000),
    alt_text: optionalText(300),
    category: optionalText(60),
    published: flag,
  }),
  resources: z
    .object({
      title: titleField,
      description: optionalText(1000),
      category: optionalText(60),
      author: optionalText(120),
      file_path: z
        .string()
        .trim()
        .refine((v) => v === "" || RESOURCE_PATH_PATTERN.test(v), "مسار الملف غير صالح.")
        .transform((v) => v || null),
      file_name: optionalText(255),
      mime_type: z
        .string()
        .trim()
        .refine((v) => v === "" || isResourceType(v), "نوع الملف غير مدعوم.")
        .transform((v) => v || null),
      file_size: optionalInt(1, MAX_RESOURCE_BYTES, "حجم الملف غير صالح."),
      external_url: optionalUrl,
      thumbnail_url: optionalUrl,
      published: flag,
    })
    .refine((v) => !v.published || v.file_path || v.external_url, {
      message: "لا يمكن نشر مورد بدون ملف أو رابط.",
      path: ["file"],
    }),
  books: z.object({
    title: titleField,
    slug: slugField,
    author: optionalText(120),
    description: richText,
    purchase_url: optionalUrl,
    sample_url: optionalUrl,
    cover_image_url: optionalUrl,
    category: optionalText(60),
    publication_year: optionalInt(1000, 2100, "سنة غير صالحة."),
    pages: optionalInt(1, 100000, "عدد صفحات غير صالح."),
    price_label: optionalText(80),
    featured: flag,
    published: flag,
  }),
  lectures: z
    .object({
      title: titleField,
      slug: slugField,
      youtube_id: youtubeField,
      external_url: optionalUrl,
      description: richText,
      thumbnail_url: optionalUrl,
      category: optionalText(60),
      speaker: optionalText(120),
      lecture_date: optionalDate,
      duration: optionalText(20),
      featured: flag,
      published: flag,
    })
    .refine((v) => !v.published || v.youtube_id || v.external_url, {
      message: "أضيفي رابط يوتيوب أو رابطًا خارجيًا قبل النشر.",
      path: ["youtube_id"],
    }),
} satisfies Record<CollectionKey, z.ZodType>;

const COMMENT_TYPE: Partial<Record<CollectionKey, CommentContentType>> = { books: "book", lectures: "lecture" };

/**
 * The four tables share one code path; values are validated by the zod schemas above,
 * so an untyped table handle is used here instead of a union of generated types.
 */
function table(supabase: SupabaseClient, key: CollectionKey) {
  return supabase.from(COLLECTIONS[key].table);
}

function revalidate(key: CollectionKey) {
  revalidateTag(CACHE_TAGS[key]);
  if (COMMENT_TYPE[key]) revalidateTag(CACHE_TAGS.comments);
}

async function resourceFileExists(supabase: SupabaseClient, path: string) {
  const folder = path.slice(0, path.lastIndexOf("/"));
  const name = path.slice(folder.length + 1);
  const { data, error } = await supabase.storage.from(RESOURCES_BUCKET).list(folder, { search: name, limit: 1 });
  return !error && Boolean(data?.some((o) => o.name === name));
}

export async function saveCollectionItem(
  key: string,
  id: string | null,
  input: Record<string, unknown>
): Promise<ActionResult<{ id: string }>> {
  if (!isCollectionKey(key)) return fail("قسم غير معروف.");
  const parsed = SCHEMAS[key].safeParse(input);
  if (!parsed.success) return fromZodError(parsed.error);

  return withAdmin(async ({ supabase }) => {
    const db = supabase as unknown as SupabaseClient;
    const values: Record<string, unknown> = { ...parsed.data };
    let previousFile: string | null = null;

    if (key === "resources") {
      if (id) {
        const { data } = await table(db, key).select("file_path").eq("id", id).maybeSingle();
        previousFile = (data?.file_path as string | null) ?? null;
      }
      const path = values.file_path as string | null;
      if (path && path !== previousFile && !(await resourceFileExists(db, path))) {
        return fail("لم يتم العثور على الملف المرفوع. ارفعيه مرة أخرى.", { file: "الملف غير موجود" });
      }
      values.file_url = path ? db.storage.from(RESOURCES_BUCKET).getPublicUrl(path).data.publicUrl : null;
      if (!path) Object.assign(values, { file_name: null, mime_type: null, file_size: null });
    }

    if (!id) {
      // New items go to the end of the manual order.
      const { data: last } = await table(db, key).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      values.sort_order = ((last?.[0]?.sort_order as number | undefined) ?? 0) + 10;
    }

    const { data, error } = await (id ? table(db, key).update(values).eq("id", id) : table(db, key).insert(values))
      .select("id")
      .single();
    if (error) return fromDbError(error);

    if (previousFile && previousFile !== values.file_path) {
      await db.storage.from(RESOURCES_BUCKET).remove([previousFile]);
    }
    revalidate(key);
    return ok({ id: data.id as string });
  });
}

export async function setCollectionFlag(
  key: string,
  id: string,
  column: "published" | "featured",
  value: boolean
): Promise<ActionResult> {
  if (!isCollectionKey(key) || (column === "featured" && !COLLECTIONS[key].hasFeatured)) return fail("طلب غير صالح.");
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await table(supabase as unknown as SupabaseClient, key)
      .update({ [column]: value }, { count: "exact" })
      .eq("id", id);
    if (error) {
      if (error.code === "23514") return fail("أكملي بيانات العنصر (ملف أو رابط) قبل نشره.");
      return fromDbError(error);
    }
    if (!count) return fail("العنصر غير موجود.");
    revalidate(key);
    return ok(null);
  });
}

/** Moves an item one place up or down in the manual order. */
export async function moveCollectionItem(key: string, id: string, direction: "up" | "down"): Promise<ActionResult> {
  if (!isCollectionKey(key)) return fail("قسم غير معروف.");
  return withAdmin(async ({ supabase }) => {
    const db = supabase as unknown as SupabaseClient;
    const { data, error } = await table(db, key)
      .select("id, sort_order")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) return fromDbError(error);

    const rows = (data ?? []) as { id: string; sort_order: number }[];
    const index = rows.findIndex((r) => r.id === id);
    const target = direction === "up" ? index - 1 : index + 1;
    if (index === -1) return fail("العنصر غير موجود.");
    if (target < 0 || target >= rows.length) return ok(null);

    [rows[index], rows[target]] = [rows[target], rows[index]];
    // Renumber (10, 20, …) and write only the rows whose position changed.
    for (const [i, row] of rows.entries()) {
      const next = (i + 1) * 10;
      if (row.sort_order !== next) {
        const { error: updateError } = await table(db, key).update({ sort_order: next }).eq("id", row.id);
        if (updateError) return fromDbError(updateError);
      }
    }
    revalidate(key);
    return ok(null);
  });
}

export async function deleteCollectionItem(key: string, id: string): Promise<ActionResult> {
  if (!isCollectionKey(key)) return fail("قسم غير معروف.");
  return withAdmin(async ({ supabase }) => {
    const db = supabase as unknown as SupabaseClient;
    const { data: existing, error: readError } = await table(db, key)
      .select(key === "resources" ? "id, file_path" : "id")
      .eq("id", id)
      .maybeSingle();
    if (readError) return fromDbError(readError);
    if (!existing) return fail("العنصر غير موجود أو حُذف بالفعل.");

    const { error } = await table(db, key).delete().eq("id", id);
    if (error) return fromDbError(error);

    const filePath = (existing as { file_path?: string | null }).file_path;
    if (filePath) await db.storage.from(RESOURCES_BUCKET).remove([filePath]);
    const commentType = COMMENT_TYPE[key];
    if (commentType) await supabase.from("comments").delete().eq("content_type", commentType).eq("content_id", id);

    revalidate(key);
    return ok(null);
  });
}
