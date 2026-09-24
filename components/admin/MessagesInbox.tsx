"use client";

import { useEffect, useState, useTransition } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Mail, MailOpen, Reply, Trash2, X } from "lucide-react";
import { deleteMessage, setMessageRead } from "@/lib/actions/messages";
import type { MessageRow } from "@/types/database";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { StatusBadge } from "./StatusBadge";

function MessageDialog({ message, onClose }: { message: MessageRow; onClose: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function markUnread() {
    startTransition(async () => {
      const result = await setMessageRead(message.id, false);
      if (!result.ok) return void toast.error(result.error);
      toast.success("تم تعليم الرسالة كغير مقروءة");
      onClose();
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
    onClose();
    router.refresh();
    return true;
  }

  const replyHref = `mailto:${message.email}?subject=${encodeURIComponent(`رد: ${message.subject}`)}`;

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy-900/60" />
        <Dialog.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-paper p-6 shadow-soft"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <Dialog.Title className="font-display text-2xl text-navy leading-snug">{message.subject}</Dialog.Title>
            <Dialog.Close className="h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-navy/60 hover:bg-section" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          <dl className="grid sm:grid-cols-3 gap-3 rounded-xl bg-section p-4 font-ui text-sm mb-5">
            <div>
              <dt className="text-xs text-navy/50">المرسل</dt>
              <dd className="text-navy">{message.name}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy/50">البريد</dt>
              <dd className="text-navy truncate" dir="ltr">{message.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-navy/50">التاريخ</dt>
              <dd className="text-navy">{formatDate(message.created_at)}</dd>
            </div>
          </dl>
          <p className="font-body text-ink/80 leading-loose whitespace-pre-wrap break-words" dir="auto">
            {message.message}
          </p>
          <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-navy/10">
            <Button href={replyHref} size="sm">
              <Reply className="h-4 w-4" />
              الرد بالبريد
            </Button>
            <Button size="sm" variant="outline" loading={pending} onClick={markUnread}>
              <Mail className="h-4 w-4" />
              تعليم كغير مقروءة
            </Button>
            <ConfirmDialog
              title="حذف الرسالة؟"
              description="سيتم حذف الرسالة نهائيًا."
              onConfirm={remove}
              trigger={
                <Button size="sm" variant="ghost" className="text-red-600">
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              }
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Message list; opening a message shows it in a dialog and marks it as read. */
export function MessagesInbox({ messages, initialOpen }: { messages: MessageRow[]; initialOpen: MessageRow | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState<MessageRow | null>(initialOpen);

  // Mark as read when opened (also for ?open=<id> links from the dashboard).
  useEffect(() => {
    if (!open || open.is_read) return;
    void setMessageRead(open.id, true).then((result) => {
      if (result.ok) router.refresh();
    });
  }, [open, router]);

  function close() {
    setOpen(null);
    if (params.has("open")) {
      const next = new URLSearchParams(params.toString());
      next.delete("open");
      const qs = next.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}` as Route, { scroll: false });
    }
  }

  return (
    <>
      {messages.length > 0 && (
        <ul className="rounded-2xl bg-paper border border-navy/5 divide-y divide-navy/5 overflow-hidden">
          {messages.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setOpen(m)}
                className={cn(
                  "w-full text-start flex items-start gap-4 px-5 py-4 hover:bg-section/60 transition-colors",
                  !m.is_read && "bg-gold/5"
                )}
              >
                <span className={cn("mt-1 shrink-0", m.is_read ? "text-navy/30" : "text-gold-dark")} aria-hidden="true">
                  {m.is_read ? <MailOpen className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                </span>
                <span className="flex-1 min-w-0 font-ui">
                  <span className="flex items-center gap-2">
                    <span className={cn("text-sm truncate", m.is_read ? "text-navy/80" : "text-navy font-semibold")}>{m.subject}</span>
                    {!m.is_read && <StatusBadge status="unread" />}
                  </span>
                  <span className="block text-xs text-navy/50 truncate mt-0.5">
                    {m.name} · <span dir="ltr">{m.email}</span>
                  </span>
                  <span className="block text-sm text-navy/60 truncate mt-1">{m.message}</span>
                </span>
                <time dateTime={m.created_at} className="font-ui text-xs text-navy/40 shrink-0">
                  {formatDate(m.created_at, "short")}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && <MessageDialog message={open} onClose={close} />}
    </>
  );
}
