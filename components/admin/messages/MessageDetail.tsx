"use client";

import { useEffect, useRef, useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Copy, Mail, MailOpen, Trash2, UserRound, AtSign, Clock, Info } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/lib/actions/messages";
import type { MessageRow } from "@/types/database";
import { senderName } from "@/lib/messages";
import { formatDateTime } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

/** Reading pane of the inbox: sender, full message and actions. */
export function MessageDetail({
  message,
  closeHref,
  children,
}: {
  message: MessageRow;
  /** The list without this message open (after delete / back on mobile). */
  closeHref: string;
  /** Reply area (rendered below the message). */
  children?: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const markedRef = useRef<string | null>(null);

  // Opening an unread message marks it as read (once per message).
  useEffect(() => {
    if (message.is_read || markedRef.current === message.id) return;
    markedRef.current = message.id;
    void setMessageRead(message.id, true).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [message.id, message.is_read, router]);

  function toggleRead() {
    startTransition(async () => {
      const result = await setMessageRead(message.id, !message.is_read);
      if (!result.ok) return void toast.error(result.error);
      toast.success(message.is_read ? "تم التعليم كغير مقروءة" : "تم التعليم كمقروءة");
      router.refresh();
    });
  }

  async function remove() {
    const result = await deleteMessage(message.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف الرسالة");
    router.push(closeHref as Route, { scroll: false });
    router.refresh();
    return true;
  }

  async function copyEmail() {
    if (!message.email) return;
    try {
      await navigator.clipboard.writeText(message.email);
      toast.success("تم نسخ البريد الإلكتروني");
    } catch {
      toast.error("تعذّر النسخ.");
    }
  }

  return (
    <article className="flex flex-col h-full" aria-labelledby="message-sender">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-navy/10 p-5">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href={closeHref as Route}
            scroll={false}
            className="lg:hidden h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-navy/60 hover:bg-section"
            aria-label="العودة إلى قائمة الرسائل"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <span className="h-11 w-11 shrink-0 rounded-full bg-navy text-white flex items-center justify-center" aria-hidden="true">
            <UserRound className="h-5 w-5" />
          </span>
          <div className="min-w-0 font-ui">
            <h2 id="message-sender" className="font-display text-2xl text-navy leading-tight">
              {senderName(message)}
            </h2>
            <dl className="mt-1 space-y-1 text-sm text-navy/60">
              <div className="flex items-center gap-2">
                <dt className="sr-only">البريد الإلكتروني</dt>
                <AtSign className="h-4 w-4 shrink-0" aria-hidden="true" />
                {message.email ? (
                  <dd className="flex items-center gap-1 min-w-0">
                    <span dir="ltr" className="truncate">
                      {message.email}
                    </span>
                    <button type="button" onClick={copyEmail} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-section" aria-label="نسخ البريد الإلكتروني" title="نسخ">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </dd>
                ) : (
                  <dd className="text-navy/40">لم يترك بريدًا إلكترونيًا</dd>
                )}
              </div>
              <div className="flex items-center gap-2">
                <dt className="sr-only">التاريخ</dt>
                <Clock className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>
                  <time dateTime={message.created_at}>{formatDateTime(message.created_at)}</time>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 font-ui text-xs ${message.is_read ? "border-navy/10 text-navy/50" : "border-gold/40 bg-gold/10 text-gold-dark"}`}
          >
            {message.is_read ? "مقروءة" : "جديدة"}
          </span>
          <Button size="sm" variant="ghost" loading={pending} onClick={toggleRead} title={message.is_read ? "تعليم كغير مقروءة" : "تعليم كمقروءة"}>
            {!pending && (message.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />)}
            <span className="hidden sm:inline">{message.is_read ? "غير مقروءة" : "مقروءة"}</span>
          </Button>
          <ConfirmDialog
            title="حذف الرسالة؟"
            description="سيتم حذف الرسالة نهائيًا ولا يمكن استرجاعها."
            onConfirm={remove}
            trigger={
              <Button size="sm" variant="ghost" className="text-red-600" aria-label="حذف الرسالة">
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">حذف</span>
              </Button>
            }
          />
        </div>
      </header>

      <div className="p-5 sm:p-7 space-y-6 flex-1">
        {message.subject && <p className="font-ui text-sm text-navy/50">الموضوع: {message.subject}</p>}
        <div className="rounded-2xl rounded-tr-sm bg-section px-5 py-4 max-w-2xl">
          <p className="font-body text-lg text-ink/85 leading-loose whitespace-pre-wrap break-words" dir="auto">
            {message.message}
          </p>
        </div>

        {message.email ? (
          children
        ) : (
          <p className="flex items-start gap-2 rounded-xl border border-navy/10 bg-paper px-4 py-3 font-ui text-sm text-navy/60">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            لا يمكن الرد على هذه الرسالة لأن المرسل لم يترك بريدًا إلكترونيًا. يمكنك قراءتها أو حذفها.
          </p>
        )}
      </div>
    </article>
  );
}
