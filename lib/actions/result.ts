import type { PostgrestError } from "@supabase/supabase-js";
import type { ZodError } from "zod";
import { getAdminStatus, type AdminContext } from "@/lib/auth";

export type FieldErrors = Record<string, string>;

export type ActionResult<T = null> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

const GENERIC_ERROR = "حدث خطأ غير متوقع. حاولي مرة أخرى بعد قليل.";

export function ok<T>(data: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, fieldErrors?: FieldErrors): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

/** First validation message per field, keyed by field path. */
export function fromZodError(error: ZodError): ActionResult<never> {
  const fieldErrors: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fail("راجعي الحقول المظللة باللون الأحمر.", fieldErrors);
}

/** Maps database errors to friendly messages without leaking internals. */
export function fromDbError(error: PostgrestError, slugField = "slug"): ActionResult<never> {
  if (error.code === "23505") {
    return fail("هذا الرابط (slug) مستخدم بالفعل. اختاري رابطًا آخر.", {
      [slugField]: "مستخدم بالفعل",
    });
  }
  if (error.code === "23514") return fail("بعض القيم غير صالحة أو أطول من المسموح.");
  if (error.code === "42501") return fail("ليس لديك صلاحية لتنفيذ هذا الإجراء.");
  console.error("[db]", error.code, error.message);
  return fail(GENERIC_ERROR);
}

/**
 * Runs a server action body only for signed-in admins, and converts unexpected
 * exceptions into a generic error so internals never reach the browser.
 * (RLS enforces the same rule in the database.)
 */
export async function withAdmin<T>(
  fn: (ctx: AdminContext) => Promise<ActionResult<T>>
): Promise<ActionResult<T>> {
  const status = await getAdminStatus();
  if (status.status !== "ok") {
    return fail("انتهت الجلسة أو ليست لديك صلاحية. سجّلي الدخول مرة أخرى.");
  }
  try {
    return await fn(status);
  } catch (error) {
    console.error("[admin action]", error);
    return fail(GENERIC_ERROR);
  }
}
