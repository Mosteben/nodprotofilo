"use server";

import { fail, fromDbError, ok, withAdmin, type ActionResult } from "./result";

export async function setMessageRead(id: string, isRead: boolean): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase
      .from("messages")
      .update({ is_read: isRead }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("الرسالة غير موجودة.");
    return ok(null);
  });
}

export async function deleteMessage(id: string): Promise<ActionResult> {
  return withAdmin(async ({ supabase }) => {
    const { error, count } = await supabase.from("messages").delete({ count: "exact" }).eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("الرسالة غير موجودة أو حُذفت بالفعل.");
    return ok(null);
  });
}

/**
 * Records that the admin replied (from their own mail app). The site sends no e-mail;
 * this only stores the admin's own "replied" mark.
 */
export async function setMessageReplied(id: string, replied: boolean): Promise<ActionResult<{ repliedAt: string | null }>> {
  return withAdmin(async ({ supabase }) => {
    const repliedAt = replied ? new Date().toISOString() : null;
    const { error, count } = await supabase
      .from("messages")
      .update({ replied_at: repliedAt, is_read: true }, { count: "exact" })
      .eq("id", id);
    if (error) return fromDbError(error);
    if (!count) return fail("الرسالة غير موجودة.");
    return ok({ repliedAt });
  });
}
