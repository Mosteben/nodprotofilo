"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { contactSchema } from "@/lib/contact";
import type { FieldErrors } from "./result";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
  /** Whether the sent message included an e-mail (to tailor the confirmation). */
  withEmail?: boolean;
};

/** Humans need a few seconds to fill in the form; bots usually don't wait. */
const MIN_FILL_MS = 3000;

export async function submitContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    message: String(formData.get("message") ?? ""),
  };

  // Spam traps: pretend success so bots get no signal.
  const honeypot = String(formData.get("website") ?? "");
  const startedAt = Number(formData.get("startedAt"));
  if (honeypot || !Number.isFinite(startedAt) || Date.now() - startedAt < MIN_FILL_MS) {
    return { status: "success" };
  }

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: FieldErrors = {};
    for (const issue of parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    return { status: "error", message: "راجع/ي الحقول المظللة.", fieldErrors, values };
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return { status: "error", message: "إرسال الرسائل غير متاح حاليًا. حاول/ي لاحقًا.", values };
  }

  // No .select(): anonymous visitors may insert messages but never read them.
  const { error } = await supabase.from("messages").insert(parsed.data);
  if (error) {
    if (error.code === "P0001" && error.message.includes("rate_limited")) {
      return { status: "error", message: "وصلت رسائل كثيرة مؤخرًا. انتظر/ي بضع دقائق ثم حاول/ي مرة أخرى.", values };
    }
    console.error("[contact] insert failed", error.code, error.message);
    return { status: "error", message: "تعذّر إرسال الرسالة الآن. حاول/ي مرة أخرى بعد قليل.", values };
  }

  return { status: "success", withEmail: Boolean(parsed.data.email) };
}
