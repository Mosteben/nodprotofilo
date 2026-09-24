"use server";

import { z } from "zod";
import { createPublicClient } from "@/lib/supabase/public";
import type { FieldErrors } from "./result";

export type ContactState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  values?: Record<string, string>;
};

const contactSchema = z.object({
  name: z.string().trim().min(2, "اكتبي اسمك (حرفان على الأقل).").max(100, "الاسم طويل جدًا."),
  email: z.string().trim().max(254).pipe(z.email("أدخلي بريدًا إلكترونيًا صحيحًا.")),
  subject: z.string().trim().min(2, "اكتبي موضوع الرسالة.").max(200, "الموضوع طويل جدًا."),
  message: z.string().trim().min(10, "الرسالة قصيرة جدًا (10 أحرف على الأقل).").max(5000, "الرسالة طويلة جدًا (5000 حرف كحد أقصى)."),
});

/** Humans need a few seconds to fill in the form; bots usually don't wait. */
const MIN_FILL_MS = 3000;

export async function submitContactMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
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
    return { status: "error", message: "راجعي الحقول المظللة.", fieldErrors, values };
  }

  const supabase = createPublicClient();
  if (!supabase) {
    return { status: "error", message: "نموذج التواصل غير متاح حاليًا. راسليني عبر البريد الإلكتروني.", values };
  }

  // No .select(): anonymous visitors may insert messages but never read them.
  const { error } = await supabase.from("messages").insert(parsed.data);
  if (error) {
    if (error.code === "P0001" && error.message.includes("rate_limited")) {
      return { status: "error", message: "تم إرسال عدة رسائل مؤخرًا. انتظري بضع دقائق ثم حاولي مرة أخرى.", values };
    }
    console.error("[contact] insert failed", error.code, error.message);
    return { status: "error", message: "تعذّر إرسال الرسالة الآن. حاولي لاحقًا أو راسليني عبر البريد.", values };
  }

  return { status: "success" };
}
