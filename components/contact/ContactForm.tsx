"use client";

import { useActionState, useEffect, useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { submitContactMessage, type ContactState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";

export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContactMessage, { status: "idle" });
  // Time the form became usable; the server rejects instant (bot) submissions.
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => setStartedAt(Date.now()), []);
  const errors = state.fieldErrors ?? {};
  const value = (key: string) => state.values?.[key];

  if (state.status === "success") {
    return (
      <div className="rounded-2xl bg-section p-10 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-gold-dark mx-auto mb-4" />
        <h3 className="font-display text-2xl text-navy mb-2">تم إرسال رسالتك</h3>
        <p className="text-navy/60 font-ui">شكرًا لتواصلك، سأرد عليك في أقرب وقت ممكن.</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5" noValidate>
      {state.status === "error" && state.message && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">اتركي هذا الحقل فارغًا</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="grid sm:grid-cols-2 gap-5">
        <Field id="name" label="الاسم" required error={errors.name}>
          <Input {...describedBy("name", errors.name)} name="name" autoComplete="name" required maxLength={100} defaultValue={value("name")} disabled={pending} />
        </Field>
        <Field id="email" label="البريد الإلكتروني" required error={errors.email}>
          <Input {...describedBy("email", errors.email)} name="email" type="email" dir="ltr" autoComplete="email" required maxLength={254} defaultValue={value("email")} disabled={pending} />
        </Field>
      </div>
      <Field id="subject" label="الموضوع" required error={errors.subject}>
        <Input {...describedBy("subject", errors.subject)} name="subject" required maxLength={200} defaultValue={value("subject")} disabled={pending} />
      </Field>
      <Field id="message" label="الرسالة" required error={errors.message}>
        <Textarea {...describedBy("message", errors.message)} name="message" required rows={6} maxLength={5000} defaultValue={value("message")} disabled={pending} />
      </Field>
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" loading={pending}>
        {!pending && <Send className="h-4 w-4" />}
        {pending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
      </Button>
    </form>
  );
}
