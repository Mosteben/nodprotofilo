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
