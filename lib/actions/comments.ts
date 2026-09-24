"use server";

import { revalidateTag } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { isUuid } from "@/lib/utils";
import { fail, fromDbError, ok, withAdmin, type ActionResult, type FieldErrors } from "./result";

export type CommentFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
};

const CONTENT_TYPES = ["article", "project", "book", "lecture"] as const;
const MIN_FILL_MS = 3000;

const commentSchema = z.object({
  content_type: z.enum(CONTENT_TYPES),
  content_id: z.string().refine(isUuid),
  body: z.string().trim().min(2, "اكتب/ي تعليقًا (حرفان على الأقل).").max(3000, "التعليق طويل جدًا (3000 حرف كحد أقصى)."),
  is_anonymous: z.boolean(),
});

const guestSchema = z.object({
  author_name: z.string().trim().min(2, "اكتب/ي اسمك (حرفان على الأقل).").max(80, "الاسم طويل جدًا."),
  author_email: z
    .string()
    .trim()
    .max(254)
    .refine((v) => v === "" || z.email().safeParse(v).success, "بريد إلكتروني غير صالح.")
    .transform((v) => v || null),
});

function issues(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

/**
 * Public comment submission. Signed-in users post under their account; guests post with
 * a name (e-mail optional, never shown). Comments are always stored pending — the
 * database trigger enforces that, binds the author and rate-limits.
 */
export async function submitComment(_prev: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const get = (key: string) => String(formData.get(key) ?? "");
  const values = { author_name: get("author_name"), author_email: get("author_email"), body: get("body") };

  // Spam traps: pretend success so bots learn nothing.
  const startedAt = Number(formData.get("startedAt"));
  if (get("website") || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) return { status: "success" };

  const base = commentSchema.safeParse({
    content_type: get("content_type"),
    content_id: get("content_id"),
    body: values.body,
    is_anonymous: formData.get("is_anonymous") === "on",
  });
  if (!base.success) return { status: "error", message: "راجع/ي التعليق.", fieldErrors: issues(base.error), values };

  const userClient = await createClient();
  const {
    data: { user },
  } = userClient ? await userClient.auth.getUser() : { data: { user: null } };

  let row: { author_name: string; author_email: string | null };
  if (user && userClient) {
    const { data: profile } = await userClient.from("profiles").select("name").eq("user_id", user.id).maybeSingle();
    row = { author_name: (profile?.name || user.email?.split("@")[0] || "مستخدم").slice(0, 80), author_email: user.email ?? null };
  } else {
    const guest = guestSchema.safeParse(values);
    if (!guest.success) return { status: "error", message: "راجع/ي الحقول المظللة.", fieldErrors: issues(guest.error), values };
    row = guest.data;
  }

  // Signed-in users insert with their session (the trigger records user_id); guests use the anon client.
  const client = user ? userClient : createPublicClient();
  if (!client) return { status: "error", message: "التعليقات غير متاحة حاليًا.", values };

  const { error } = await client.from("comments").insert({ ...base.data, ...row });
  if (error) {
    if (error.message.includes("rate_limited")) {
      return { status: "error", message: "أرسلت عدة تعليقات مؤخرًا. انتظر/ي بضع دقائق.", values };
    }
    if (error.message.includes("invalid_target")) return { status: "error", message: "لا يمكن التعليق على هذا المحتوى.", values };
    console.error("[comments] insert failed", error.code, error.message);
    return { status: "error", message: "تعذّر إرسال التعليق الآن. حاول/ي لاحقًا.", values };
  }
  return { status: "success" };
}

// --- Moderation (admin only) ---------------------------------------------------

export async function setCommentApproved(id: string, approved: boolean): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase
      .from("comments")
      .update({ is_approved: approved, is_read: true }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("التعليق غير موجود.");
    revalidateTag(CACHE_TAGS.comments);
    return ok(null);
  });
}

export async function setCommentRead(id: string, read: boolean): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase.from("comments").update({ is_read: read }, { count: "exact" }).eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("التعليق غير موجود.");
    return ok(null);
  });
}

export async function deleteComment(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase.from("comments").delete({ count: "exact" }).eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("التعليق غير موجود أو حُذف بالفعل.");
    revalidateTag(CACHE_TAGS.comments);
    return ok(null);
  });
}

