"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Undo2, Mail, MailOpen, Trash2, ExternalLink, EyeOff, Loader2 } from "lucide-react";
import { deleteComment, setCommentApproved, setCommentRead } from "@/lib/actions/comments";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "./ConfirmDialog";

export type ModerationComment = {
  id: string;
  authorName: string;
  authorEmail: string | null;
  isAccount: boolean;
  body: string;
  isAnonymous: boolean;
  isApproved: boolean;
  isRead: boolean;
  createdAt: string;
  typeLabel: string;
  targetTitle: string;
  targetHref: string | null;
};

export function CommentRow({ comment }: { comment: ModerationComment }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, success: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) return void toast.error(result.error);
      toast.success(success);
      router.refresh();
    });
  }

  async function remove() {
    const result = await deleteComment(comment.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف التعليق");
    router.refresh();
    return true;
  }

  return (
    <li className={cn("px-5 py-4 space-y-3", !comment.isRead && "bg-gold/5")}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-ui text-sm">
        <span className={cn("font-semibold text-navy", !comment.isRead && "text-navy")}>{comment.authorName}</span>
        {comment.authorEmail && (
          <span className="text-xs text-navy/50" dir="ltr">
            {comment.authorEmail}
          </span>
        )}
        <span className="text-xs rounded-full bg-section px-2 py-0.5 text-navy/60">{comment.isAccount ? "حساب مسجّل" : "زائر"}</span>
        {comment.isAnonymous && (
          <span className="text-xs rounded-full bg-navy/5 px-2 py-0.5 text-navy/60 flex items-center gap-1">
            <EyeOff className="h-3 w-3" /> مجهول للعامة
          </span>
        )}
        <span
          className={cn(
            "text-xs rounded-full border px-2 py-0.5",
            comment.isApproved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
          )}
        >
          {comment.isApproved ? "معتمد" : "بانتظار المراجعة"}
        </span>
        <time dateTime={comment.createdAt} className="text-xs text-navy/40 ms-auto">
          {formatDate(comment.createdAt, "short")}
        </time>
      </div>

      <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line break-words" dir="auto">
        {comment.body}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-ui text-xs text-navy/50 me-auto">
          {comment.typeLabel}:{" "}
          {comment.targetHref ? (
            <a href={comment.targetHref} target="_blank" rel="noreferrer" className="text-gold-dark hover:underline inline-flex items-center gap-1">
              {comment.targetTitle} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            comment.targetTitle
          )}
        </span>
        {pending && <Loader2 className="h-4 w-4 animate-spin text-navy/40" aria-label="جارٍ الحفظ" />}
        {comment.isApproved ? (
          <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => setCommentApproved(comment.id, false), "تم إلغاء الاعتماد")}>
            <Undo2 className="h-4 w-4" />
            إلغاء الاعتماد
          </Button>
        ) : (
          <Button size="sm" variant="gold" disabled={pending} onClick={() => run(() => setCommentApproved(comment.id, true), "تم اعتماد التعليق ونشره")}>
            <Check className="h-4 w-4" />
            اعتماد
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={pending}
          onClick={() => run(() => setCommentRead(comment.id, !comment.isRead), comment.isRead ? "تم التعليم كغير مقروء" : "تم التعليم كمقروء")}
        >
          {comment.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
          {comment.isRead ? "غير مقروء" : "مقروء"}
        </Button>
        <ConfirmDialog
          title="حذف التعليق؟"
          description="سيتم حذف التعليق نهائيًا."
          onConfirm={remove}
          trigger={
            <Button size="sm" variant="ghost" className="text-red-600" disabled={pending}>
              <Trash2 className="h-4 w-4" />
              حذف
            </Button>
          }
        />
      </div>
    </li>
  );
}
