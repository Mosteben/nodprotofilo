"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Send } from "lucide-react";
import { submitComment, type CommentFormState } from "@/lib/actions/comments";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CommentContentType } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea, describedBy } from "@/components/ui/form";

/**
 * Comment form. Whether the visitor is signed in is checked in the browser after mount,
 * so the surrounding page stays static (and server/client HTML match on first render).
 */
export function CommentForm({ contentType, contentId }: { contentType: CommentContentType; contentId: string }) {
  const [state, action, pending] = useActionState<CommentFormState, FormData>(submitComment, { status: "idle" });
  const [startedAt, setStartedAt] = useState(0);
  const [account, setAccount] = useState<{ signedIn: boolean; email?: string } | null>(null);

  useEffect(() => {
    setStartedAt(Date.now());
    if (!isSupabaseConfigured()) return setAccount({ signedIn: false });
    createClient()
      .auth.getUser()
      .then(({ data }) => setAccount(data.user ? { signedIn: true, email: data.user.email } : { signedIn: false }))
      .catch(() => setAccount({ signedIn: false }));
  }, []);

  const errors = state.fieldErrors ?? {};
  const value = (key: string) => state.values?.[key];

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-paper p-8 text-center border border-navy/10" role="status">
        <CheckCircle2 className="h-9 w-9 text-gold-dark mx-auto mb-3" />
        <p className="font-display text-xl text-navy mb-1">شكرًا لتعليقك!</p>
        <p className="font-ui text-sm text-navy/60">سيظهر بعد مراجعته.</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl bg-paper p-6 border border-navy/10 space-y-5 relative" noValidate>
      <h3 className="font-display text-xl text-navy">أضف/ي تعليقًا</h3>

      {state.status === "error" && state.message && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
          {state.message}
        </div>
      )}

      <input type="hidden" name="content_type" value={contentType} />
      <input type="hidden" name="content_id" value={contentId} />
      <input type="hidden" name="startedAt" value={startedAt} />
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`website-${contentId}`}>اترك/ي هذا الحقل فارغًا</label>
        <input id={`website-${contentId}`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {account?.signedIn ? (
        <p className="font-ui text-sm text-navy/60">
          تعلّق/ين بحسابك <span dir="ltr">{account.email}</span>.{" "}
          <Link href="/account" className="text-gold-dark hover:underline">
            حسابي
          </Link>
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-5">
            <Field id={`author_name-${contentId}`} label="الاسم" error={errors.author_name} required>
              <Input {...describedBy(`author_name-${contentId}`, errors.author_name)} name="author_name" autoComplete="name" maxLength={80} defaultValue={value("author_name")} disabled={pending} />
            </Field>
            <Field id={`author_email-${contentId}`} label="البريد الإلكتروني (اختياري)" error={errors.author_email} hint="لا يُعرض للزوار أبدًا.">
              <Input {...describedBy(`author_email-${contentId}`, errors.author_email, "hint")} name="author_email" type="email" dir="ltr" autoComplete="email" defaultValue={value("author_email")} disabled={pending} />
            </Field>
          </div>
          {account && (
            <p className="font-ui text-xs text-navy/50">
              لديك حساب؟{" "}
              <Link href="/account/login" className="text-gold-dark hover:underline">
                سجّل/ي الدخول
              </Link>{" "}
              للتعليق باسم حسابك.
            </p>
          )}
        </>
      )}

      <Field id={`body-${contentId}`} label="التعليق" error={errors.body} required>
        <Textarea {...describedBy(`body-${contentId}`, errors.body)} name="body" rows={4} maxLength={3000} defaultValue={value("body")} disabled={pending} />
      </Field>

      <Checkbox id={`is_anonymous-${contentId}`} name="is_anonymous" label="النشر بشكل مجهول" description="لن يظهر اسمك مع التعليق." disabled={pending} />

      <Button type="submit" size="sm" loading={pending}>
        {!pending && <Send className="h-4 w-4" />}
        إرسال التعليق
      </Button>
      <p className="font-ui text-xs text-navy/40">تظهر التعليقات بعد مراجعتها.</p>
    </form>
  );
}
