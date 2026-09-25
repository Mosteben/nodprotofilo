import Link from "next/link";
import type { Route } from "next";
import type { MessageRow } from "@/types/database";
import { messageTitle, senderName } from "@/lib/messages";
import { formatListDate } from "@/lib/datetime";
import { cn } from "@/lib/utils";

/** Inbox list (server-rendered). Each row links to ?open=<id>, keeping the current filters. */
export function MessageList({
  messages,
  selectedId,
  hrefFor,
  now,
}: {
  messages: MessageRow[];
  selectedId: string | null;
  hrefFor: (id: string) => string;
  now: Date;
}) {
  return (
    <ul className="divide-y divide-navy/5" aria-label="الرسائل">
      {messages.map((m) => {
        const selected = m.id === selectedId;
        return (
          <li key={m.id}>
            <Link
              href={hrefFor(m.id) as Route}
              scroll={false}
              aria-current={selected ? "true" : undefined}
              className={cn(
                "flex gap-3 px-4 py-3.5 transition-colors border-s-4",
                selected ? "bg-gold/10 border-gold" : "border-transparent hover:bg-section/70",
                !m.is_read && !selected && "bg-navy/[0.03]"
              )}
            >
              <span
                className={cn("mt-2 h-2.5 w-2.5 shrink-0 rounded-full", m.is_read ? "bg-transparent" : "bg-gold")}
                aria-label={m.is_read ? undefined : "غير مقروءة"}
                role={m.is_read ? undefined : "img"}
              />
              <span className="flex-1 min-w-0 font-ui">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={cn("text-sm truncate", m.is_read ? "text-navy/80" : "text-navy font-bold")}>{senderName(m)}</span>
                  <time dateTime={m.created_at} className="text-[11px] text-navy/40 shrink-0">
                    {formatListDate(m.created_at, now)}
                  </time>
                </span>
                <span className={cn("block text-sm truncate mt-0.5", m.is_read ? "text-navy/50" : "text-navy/80")} dir="auto">
                  {messageTitle(m, 90)}
                </span>
                {!m.email && <span className="block text-[11px] text-navy/35 mt-0.5">بدون بريد إلكتروني</span>}
                {m.replied_at && <span className="block text-[11px] text-emerald-700 mt-0.5">✓ تم الرد</span>}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
