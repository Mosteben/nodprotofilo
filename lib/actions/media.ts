"use server";

import { z } from "zod";
import { MEDIA_BUCKET } from "@/lib/supabase/config";
import { MAX_UPLOAD_BYTES, STORAGE_PATH_PATTERN, isAllowedImageType } from "@/lib/media";
import type { MediaRow } from "@/types/database";
import { fail, fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

const registerSchema = z.object({
  file_path: z.string().regex(STORAGE_PATH_PATTERN, "مسار الملف غير صالح."),
  file_name: z.string().trim().min(1).max(255),
  mime_type: z.string().refine(isAllowedImageType, "نوع الملف غير مدعوم."),
  size: z.number().int().positive().max(MAX_UPLOAD_BYTES, "الملف أكبر من المسموح."),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  alt_text: z.string().trim().max(300).transform((v) => v || null),
});

export type RegisterMediaInput = z.input<typeof registerSchema>;

/**
 * Records a file the browser has just uploaded to the media bucket. The object must
 * exist in storage — otherwise nothing is recorded.
 */
export async function registerMedia(input: RegisterMediaInput): Promise<ActionResult<MediaRow>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) return fromZodError(parsed.error);
    const values = parsed.data;

    const folder = values.file_path.slice(0, values.file_path.lastIndexOf("/"));
    const name = values.file_path.slice(folder.length + 1);
    const { data: objects, error: listError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .list(folder, { search: name, limit: 1 });
    if (listError || !objects?.some((o) => o.name === name)) {
      return fail("لم يتم العثور على الملف المرفوع. حاولي الرفع مرة أخرى.");
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(values.file_path);

    const { data, error } = await supabase
      .from("media")
      .insert({ ...values, file_url: publicUrl })
      .select("*")
      .single();
    if (error) return fromDbError(error);
    return ok(data);
  });
}

export async function updateMediaAlt(id: string, altText: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const alt = altText.trim();
    if (alt.length > 300) return fail("النص البديل طويل جدًا (300 حرف كحد أقصى).");
    const { error, count } = await supabase
      .from("media")
      .update({ alt_text: alt || null }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("الملف غير موجود.");
    return ok(null);
  });
}

/** Deletes the file from storage and its metadata row. */
export async function deleteMedia(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { data: media, error } = await supabase.from("media").select("file_path").eq("id", id).maybeSingle();
    if (error) return fromDbError(error);
    if (!media) return fail("الملف غير موجود أو حُذف بالفعل.");

    const { error: storageError } = await supabase.storage.from(MEDIA_BUCKET).remove([media.file_path]);
    if (storageError) {
      console.error("[media] storage delete failed", storageError.message);
      return fail("تعذّر حذف الملف من التخزين. حاولي مرة أخرى.");
    }

    const { error: deleteError } = await supabase.from("media").delete().eq("id", id);
    if (deleteError) return fromDbError(deleteError);
    return ok(null);
  });
}
