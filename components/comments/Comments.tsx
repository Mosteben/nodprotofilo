import { MessageSquare, UserRound } from "lucide-react";
import { getApprovedComments } from "@/lib/data/comments";
import { formatDate } from "@/lib/datetime";
import type { CommentContentType } from "@/types/database";
import { CommentForm } from "./CommentForm";

/** Approved comments for one item plus the submission form. */
export async function Comments({ contentType, contentId }: { contentType: CommentContentType; contentId: string }) {
  const comments = await getApprovedComments(contentType, contentId);

  return (
    <section className="section-py bg-section" aria-labelledby={`comments-${contentId}`}>
      <div className="container-narrow px-6">
        <h2 id={`comments-${contentId}`} className="font-display text-2xl text-navy mb-8 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-gold-dark" />
          التعليقات {comments.length > 0 && <span className="font-ui text-base text-navy/40">({comments.length})</span>}
        </h2>

        {comments.length === 0 ? (
          <p className="font-ui text-sm text-navy/50 mb-8">لا توجد تعليقات بعد — كن/كوني أول من يعلّق.</p>
        ) : (
          <ol className="space-y-4 mb-10">
            {comments.map((c) => (
              <li key={c.id} className="rounded-2xl bg-paper p-5 border border-navy/5">
                <div className="flex items-center justify-between gap-3 mb-2 font-ui">
                  <span className="flex items-center gap-2 text-sm font-semibold text-navy">
                    <UserRound className="h-4 w-4 text-gold-dark" />
                    {c.displayName ?? "زائر مجهول"}
                  </span>
                  <time dateTime={c.createdAt} className="text-xs text-navy/40">
                    {formatDate(c.createdAt, "short")}
                  </time>
                </div>
                <p className="text-ink/80 leading-relaxed whitespace-pre-line break-words" dir="auto">
                  {c.body}
                </p>
              </li>
            ))}
          </ol>
        )}

        <CommentForm contentType={contentType} contentId={contentId} />
      </div>
    </section>
  );
}
