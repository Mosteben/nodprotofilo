import type { MessageRow } from "@/types/database";

type MessageLike = Pick<MessageRow, "name" | "subject" | "message">;

/** Display name for a sender who may not have given one. */
export function senderName(m: Pick<MessageRow, "name">): string {
  return m.name?.trim() || "زائر بدون اسم";
}

/** One-line title: the subject (older messages) or the start of the message. */
export function messageTitle(m: MessageLike, max = 80): string {
  const text = (m.subject?.trim() || m.message).replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** Longest mailto: link we generate; some mail apps truncate or refuse longer ones. */
const MAX_MAILTO_LENGTH = 1900;

/**
 * mailto: link that opens the admin's own mail app with the reply pre-filled. Nothing is
 * sent by the site. The original message is quoted when it fits; `tooLong` means even the
 * reply alone does not fit, so it should be copied and pasted instead.
 */
export function buildReplyMailto(
  m: Pick<MessageRow, "email" | "name" | "subject" | "message">,
  draft: string,
  sentAt: string
): { href: string; tooLong: boolean } | null {
  if (!m.email) return null;
  const subject = `رد: ${messageTitle(m, 60)}`;
  const quote = m.message
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
  const make = (body: string) =>
    `mailto:${encodeURIComponent(m.email!).replace(/%40/g, "@")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body.replace(/\r?\n/g, "\r\n"))}`;

  const withQuote = make(`${draft.trim()}\n\n— ${sentAt}، ${senderName(m)} كتب/ت:\n${quote}`);
  if (withQuote.length <= MAX_MAILTO_LENGTH) return { href: withQuote, tooLong: false };
  const replyOnly = make(draft.trim());
  return { href: replyOnly, tooLong: replyOnly.length > MAX_MAILTO_LENGTH };
}
