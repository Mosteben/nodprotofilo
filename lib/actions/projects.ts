"use server";

import { revalidateTag } from "next/cache";
import { projectSchema, type ProjectInput } from "@/lib/validation";
import { sanitizeRichText } from "@/lib/sanitize";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { fail, fromDbError, fromZodError, ok, withAdmin, type ActionResult } from "./result";

type Saved = { id: string; slug: string; published: boolean };

/** Creates a project (id = null) or updates an existing one. */
export async function saveProject(id: string | null, input: ProjectInput): Promise<ActionResult<Saved>> {
  return withAdmin(async ({ supabase }) => {
    const parsed = projectSchema.safeParse(input);
    if (!parsed.success) return fromZodError(parsed.error);

    const values = { ...parsed.data, content: sanitizeRichText(parsed.data.content) };
    const { data, error } = await (id
      ? supabase.from("projects").update(values).eq("id", id)
      : supabase.from("projects").insert(values)
    )
      .select("id, slug, published")
      .single();

    if (error) return fromDbError(error);
    revalidateTag(CACHE_TAGS.projects);
    return ok(data);
  });
}

/** Toggles a boolean flag (published / featured) from the project list. */
export async function setProjectFlag(
  id: string,
  flag: "published" | "featured",
  value: boolean
): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase
      .from("projects")
      .update(flag === "published" ? { published: value } : { featured: value }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("المشروع غير موجود.");
    revalidateTag(CACHE_TAGS.projects);
    return ok(null);
  });
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase.from("projects").delete({ count: "exact" }).eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("المشروع غير موجود أو حُذف بالفعل.");
    await supabase.from("comments").delete().eq("content_type", "project").eq("content_id", id);
    revalidateTag(CACHE_TAGS.projects);
    return ok(null);
  });
}
