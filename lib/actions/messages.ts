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
