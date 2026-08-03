"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Wire this up to an email/service provider or API route when ready.
    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="rounded-2xl bg-section p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-gold-dark mx-auto mb-4" />
        <h3 className="font-display text-2xl text-navy mb-2">تم إرسال رسالتك</h3>
        <p className="text-navy/60 font-ui">شكرًا لتواصلك، سأرد عليك في أقرب وقت ممكن.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="block font-ui text-sm text-navy mb-2">الاسم</label>
          <input
            id="name"
            required
            className="w-full h-12 rounded-xl bg-section px-4 outline-none border border-navy/10 focus-visible:border-gold"
          />
        </div>
        <div>
          <label htmlFor="email" className="block font-ui text-sm text-navy mb-2">البريد الإلكتروني</label>
          <input
            id="email"
            type="email"
            required
            className="w-full h-12 rounded-xl bg-section px-4 outline-none border border-navy/10 focus-visible:border-gold"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block font-ui text-sm text-navy mb-2">الموضوع</label>
        <input
          id="subject"
          required
          className="w-full h-12 rounded-xl bg-section px-4 outline-none border border-navy/10 focus-visible:border-gold"
        />
      </div>
      <div>
        <label htmlFor="message" className="block font-ui text-sm text-navy mb-2">الرسالة</label>
        <textarea
          id="message"
          required
          rows={5}
          className="w-full rounded-xl bg-section p-4 outline-none border border-navy/10 focus-visible:border-gold resize-none"
        />
      </div>
      <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto">
        <Send className="h-4 w-4" />
        إرسال الرسالة
      </Button>
    </form>
  );
}
