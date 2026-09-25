"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Reply, Copy, ExternalLink, CheckCircle2, Undo2, Info } from "lucide-react";
import { setMessageReplied } from "@/lib/actions/messages";
import { buildReplyMailto } from "@/lib/messages";
import { formatDateTime } from "@/lib/datetime";
import type { MessageRow } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const draftKey = (id: string) => `reply-draft:${id}`;

/**
 * Reply area. The site does not send e-mail: the draft is written here, then opened in the
 * admin's own mail app (mailto) or copied. "Mark as replied" is the admin's manual record
 * that the reply was actually sent — nothing is marked automatically.
 */
export function ReplyComposer({ message }: { message: MessageRow }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [opened, setOpened] = useState(false);
  const [repliedAt, setRepliedAt] = useState(message.replied_at);
  const [pending, startTransition] = useTransition();

  // Restore/save the draft in this browser only (a convenience; never sent anywhere).
  useEffect(() => {
    try {
      setDraft(window.localStorage.getItem(draftKey(message.id)) ?? "");
    } catch {
      // Storage unavailable (private mode) — start empty.
    }
  }, [message.id]);

  function updateDraft(value: string) {
    setDraft(value);
    try {
      if (value) window.localStorage.setItem(draftKey(message.id), value);
      else window.localStorage.removeItem(draftKey(message.id));
    } catch {
      // Ignore storage errors; the draft stays in memory.
    }
  }

  const mailto = buildReplyMailto(message, draft, formatDateTime(message.created_at));

  async function copy() {
    try {
      await navigator.clipboard.writeText(draft);
      toast.success("تم نسخ الرد — الصقيه في بريدك.");
    } catch {
      toast.error("تعذّر النسخ.");
    }
  }

  function markReplied(replied: boolean) {
    startTransition(async () => {
      const result = await setMessageReplied(message.id, replied);
      if (!result.ok) return void toast.error(result.error);
      setRepliedAt(result.data.repliedAt);
      if (replied) {
        updateDraft("");
        setOpened(false);
      }
      toast.success(replied ? "تم تسجيل الرد" : "تم إلغاء علامة الرد");
      router.refresh();
    });
  }

  return (
    <section aria-labelledby="reply-heading" className="rounded-2xl border border-navy/10 bg-paper">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-navy/10 px-4 py-3">
        <h3 id="reply-heading" className="font-ui text-sm font-semibold text-navy flex items-center gap-2">
          <Reply className="h-4 w-4 text-gold-dark" />
          الرد على <span dir="ltr">{message.email}</span>
        </h3>
        {repliedAt ? (
          <span className="flex items-center gap-2 font-ui text-xs text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            تم الرد ({formatDateTime(repliedAt)})
            <button type="button" onClick={() => markReplied(false)} disabled={pending} className="text-navy/50 hover:text-navy underline underline-offset-2">
              تراجع
            </button>
          </span>
        ) : (
          <span className="font-ui text-xs text-navy/40">مسودة — لم يُرسل شيء بعد</span>
        )}
      </div>

      <div className="p-4 space-y-3">
        <label htmlFor={`reply-${message.id}`} className="sr-only">
          نص الرد
        </label>
        <textarea
          id={`reply-${message.id}`}
          value={draft}
          onChange={(e) => updateDraft(e.target.value)}
          rows={6}
          maxLength={4000}
          placeholder="اكتبي ردّك هنا…"
          className="w-full rounded-xl bg-section px-4 py-3 text-base leading-relaxed text-ink placeholder:text-navy/40 outline-none border border-navy/10 resize-y focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20"
        />

        <p className="flex items-start gap-2 font-ui text-xs text-navy/50">
          <Info className="h-4 w-4 shrink-0" />
          الموقع لا يرسل البريد بنفسه: «فتح في تطبيق البريد» يجهّز الرد في بريدك لتراجعيه وترسليه من هناك.
        </p>

        {mailto?.tooLong && (
          <p role="status" className="font-ui text-xs text-amber-700">
            الرد طويل على رابط البريد — انسخيه والصقيه في رسالة جديدة.
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {mailto && !mailto.tooLong && (
            <a
              href={draft.trim() ? mailto.href : undefined}
              aria-disabled={!draft.trim()}
              onClick={() => draft.trim() && setOpened(true)}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-4 rounded-btn font-ui text-sm font-medium bg-navy text-white hover:bg-navy-600 transition-colors",
                !draft.trim() && "opacity-50 pointer-events-none"
              )}
            >
              <ExternalLink className="h-4 w-4" />
              فتح في تطبيق البريد
            </a>
          )}
          <Button type="button" size="sm" variant="outline" disabled={!draft.trim()} onClick={copy}>
            <Copy className="h-4 w-4" />
            نسخ الرد
          </Button>
          {!repliedAt && (
            <Button type="button" size="sm" variant={opened ? "gold" : "ghost"} loading={pending} onClick={() => markReplied(true)}>
              {!pending && <CheckCircle2 className="h-4 w-4" />}
              {opened ? "أرسلتُ الرد — تعليم كـ«تم الرد»" : "تعليم كـ«تم الرد»"}
            </Button>
          )}
          {repliedAt && (
            <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => markReplied(false)}>
              <Undo2 className="h-4 w-4" />
              إلغاء علامة الرد
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
