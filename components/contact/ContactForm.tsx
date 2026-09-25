"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Send, CheckCircle2, RotateCcw } from "lucide-react";
import { submitContactMessage, type ContactState } from "@/lib/actions/contact";
import { Button } from "@/components/ui/Button";
import { Field, Input, describedBy } from "@/components/ui/form";
import { cn } from "@/lib/utils";

/**
 * Chat-style contact form: only the message is required. Enter always inserts a new line;
 * Ctrl/⌘ + Enter is an explicit shortcut to send.
 */
export function ContactForm() {
  const [state, action, pending] = useActionState<ContactState, FormData>(submitContactMessage, { status: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(0);
  // The last result the visitor dismissed with "send another message" (each submit yields a new object).
  const [dismissed, setDismissed] = useState<ContactState | null>(null);
  const current = state === dismissed ? null : state;
  // Time the form became usable; the server rejects instant (bot) submissions.
  const [startedAt, setStartedAt] = useState(0);
  useEffect(() => setStartedAt(Date.now()), [formKey]);

  const errors = state.fieldErrors ?? {};
  const value = (key: string) => state.values?.[key];

  if (current?.status === "success") {
    return (
      <div className="rounded-2xl bg-section p-10 text-center" role="status">
        <CheckCircle2 className="h-10 w-10 text-gold-dark mx-auto mb-4" />
        <h3 className="font-display text-2xl text-navy mb-2">وصلت رسالتك، شكرًا لك!</h3>
        <p className="text-navy/60 font-ui">
          {current.withEmail ? "سأرد عليك على بريدك الإلكتروني في أقرب وقت." : "لم تترك/ي بريدًا إلكترونيًا، لذلك لن أتمكن من الرد مباشرة — لكن رسالتك وصلت."}
        </p>
        <Button type="button" variant="ghost" size="sm" className="mt-6" onClick={() => {
            setDismissed(state);
            setFormKey((k) => k + 1);
          }}>
          <RotateCcw className="h-4 w-4" />
          إرسال رسالة أخرى
        </Button>
      </div>
    );
  }

  const showError = current?.status === "error";

  return (
    <form key={formKey} ref={formRef} action={action} className="space-y-4" noValidate>
      {showError && state.message && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 font-ui text-sm text-red-700">
          {state.message}
        </div>
      )}

      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">اترك/ي هذا الحقل فارغًا</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <input type="hidden" name="startedAt" value={startedAt} />

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="name" label="الاسم (اختياري)" error={showError ? errors.name : undefined}>
          <Input
            {...describedBy("name", showError ? errors.name : undefined)}
            name="name"
            autoComplete="name"
            maxLength={100}
            placeholder="كيف أناديك؟"
            defaultValue={showError ? value("name") : undefined}
            disabled={pending}
          />
        </Field>
        <Field id="email" label="البريد الإلكتروني (اختياري)" error={showError ? errors.email : undefined} hint="اتركه إن لم تحتج/ي إلى رد.">
          <Input
            {...describedBy("email", showError ? errors.email : undefined, "hint")}
            name="email"
            type="email"
            dir="ltr"
            autoComplete="email"
            maxLength={254}
            placeholder="name@example.com"
            defaultValue={showError ? value("email") : undefined}
            disabled={pending}
          />
        </Field>
      </div>

      <div>
        <label htmlFor="message" className="sr-only">
          الرسالة
        </label>
        <textarea
          {...describedBy("message", showError ? errors.message : undefined, "hint")}
          name="message"
          required
          rows={8}
          maxLength={5000}
          placeholder="اكتب/ي رسالتك هنا…"
          defaultValue={showError ? value("message") : undefined}
          disabled={pending}
          onKeyDown={(e) => {
            // Enter adds a new line (default). Ctrl/⌘ + Enter sends.
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          className={cn(
            "w-full rounded-2xl bg-section px-5 py-4 text-lg leading-relaxed text-ink placeholder:text-navy/40 outline-none border resize-y min-h-[200px] transition-colors focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20",
            showError && errors.message ? "border-red-500" : "border-navy/10"
          )}
        />
        {showError && errors.message ? (
          <p id="message-error" role="alert" className="font-ui text-sm text-red-600 mt-1">
            {errors.message}
          </p>
        ) : (
          <p id="message-hint" className="font-ui text-xs text-navy/40 mt-1">
            Enter لسطر جديد · Ctrl + Enter للإرسال
          </p>
        )}
      </div>

      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" loading={pending}>
        {!pending && <Send className="h-4 w-4" />}
        {pending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
      </Button>
    </form>
  );
}
