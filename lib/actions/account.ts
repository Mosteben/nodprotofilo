"use server";

import type { Route } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { SITE } from "@/lib/constants/site";
import type { FieldErrors } from "./result";

export type AccountFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: FieldErrors;
  email?: string;
  name?: string;
};

const email = z.string().trim().max(254).pipe(z.email("أدخل/ي بريدًا إلكترونيًا صحيحًا."));

const registerSchema = z
  .object({
    name: z.string().trim().min(2, "اكتب/ي اسمك (حرفان على الأقل).").max(80, "الاسم طويل جدًا."),
    email,
    password: z.string().min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف.").max(72, "كلمة المرور طويلة جدًا."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "كلمتا المرور غير متطابقتين.", path: ["confirm"] });

const loginSchema = z.object({ email, password: z.string().min(1, "أدخل/ي كلمة المرور.") });

/** Only allow redirects to local pages (never to another site). */
function safeNext(value: FormDataEntryValue | string | null): Route {
  const next = typeof value === "string" ? value : "";
  return (next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/account") as Route;
}

function issues(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) out[String(issue.path[0])] ??= issue.message;
  return out;
}

const NOT_CONFIGURED: AccountFormState = { status: "error", message: "الحسابات غير متاحة حاليًا." };

export async function registerAccount(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const input = Object.fromEntries(["name", "email", "password", "confirm"].map((k) => [k, String(formData.get(k) ?? "")]));
  const keep = { email: input.email, name: input.name };
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "راجع/ي الحقول المظللة.", fieldErrors: issues(parsed.error), ...keep };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name },
      emailRedirectTo: `${SITE.url}/auth/callback?next=/account`,
    },
  });

  if (error) {
    const message =
      error.code === "user_already_exists"
        ? "هذا البريد مسجّل بالفعل. سجّل/ي الدخول بدلًا من ذلك."
        : error.code === "weak_password"
          ? "كلمة المرور ضعيفة. استخدم/ي كلمة أطول تجمع حروفًا وأرقامًا."
          : error.code === "signup_disabled"
            ? "التسجيل مغلق حاليًا."
            : error.status === 429
              ? "محاولات كثيرة. انتظر/ي قليلًا ثم حاول/ي مرة أخرى."
              : "تعذّر إنشاء الحساب الآن. حاول/ي لاحقًا.";
    if (!["user_already_exists", "weak_password", "signup_disabled"].includes(error.code ?? "") && error.status !== 429) {
      console.error("[account] sign-up failed", error.status, error.code);
    }
    return { status: "error", message, ...keep };
  }

  // With e-mail confirmation on, there is no session until the link is clicked.
  if (!data.session) {
    return { status: "success", message: "أرسلنا رابط تأكيد إلى بريدك الإلكتروني. افتح/ي الرابط لتفعيل الحساب." };
  }
  redirect("/account");
}

export async function signInAccount(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const input = { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? "") };
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "راجع/ي الحقول المظللة.", fieldErrors: issues(parsed.error), email: input.email };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const message =
      error.code === "email_not_confirmed"
        ? "لم يتم تأكيد البريد الإلكتروني بعد. افتح/ي رابط التأكيد المرسل إليك."
        : error.status === 429
          ? "محاولات كثيرة. انتظر/ي قليلًا ثم حاول/ي مرة أخرى."
          : error.status === 400
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة."
            : "تعذّر تسجيل الدخول الآن. حاول/ي لاحقًا.";
    return { status: "error", message, email: input.email };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signOutAccount() {
  const supabase = await createClient();
  await supabase?.auth.signOut();
  redirect("/");
}

const profileSchema = z.object({ name: z.string().trim().min(2, "الاسم قصير جدًا.").max(80, "الاسم طويل جدًا.") });

/** Lets a signed-in user change their own display name (never admin rights — see the DB trigger). */
export async function updateAccountName(_prev: AccountFormState, formData: FormData): Promise<AccountFormState> {
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { status: "error", fieldErrors: issues(parsed.error), message: "راجع/ي الاسم." };

  const supabase = await createClient();
  if (!supabase) return NOT_CONFIGURED;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "انتهت الجلسة. سجّل/ي الدخول مرة أخرى." };

  const { error } = await supabase.from("profiles").update({ name: parsed.data.name }).eq("user_id", user.id);
  if (error) {
    console.error("[account] profile update failed", error.code);
    return { status: "error", message: "تعذّر حفظ الاسم. حاول/ي لاحقًا." };
  }
  revalidatePath("/account");
  return { status: "success", message: "تم حفظ الاسم.", name: parsed.data.name };
}
