"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

const loginSchema = z.object({
  email: z.string().trim().email("أدخلي بريدًا إلكترونيًا صحيحًا."),
  password: z.string().min(1, "أدخلي كلمة المرور."),
});

/** Only allow redirects back into the admin area (prevents open redirects). */
function safeNext(value: FormDataEntryValue | null): Route {
  const next = typeof value === "string" ? value : "";
  return (next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin") as Route;
}

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  const email = String(formData.get("email") ?? "");
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const supabase = await createClient();
  if (!supabase) {
    return { error: "لم يتم إعداد Supabase بعد. راجعي متغيرات البيئة في ملف README.", email };
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.status === 429) {
      return { error: "محاولات كثيرة. انتظري قليلًا ثم حاولي مرة أخرى.", email };
    }
    if (error.code === "email_not_confirmed") {
      return { error: "لم يتم تأكيد هذا البريد الإلكتروني بعد.", email };
    }
    if (error.status === 400) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة.", email };
    }
    console.error("[auth] sign-in failed", error.status, error.code);
    return { error: "تعذّر الاتصال بخدمة تسجيل الدخول. حاولي لاحقًا.", email };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/admin/login");
}
