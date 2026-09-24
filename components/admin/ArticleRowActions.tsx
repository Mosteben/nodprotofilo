"use client";

import { useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, EyeOff, ExternalLink, Loader2 } from "lucide-react";
import { deleteArticle, setArticleStatus } from "@/lib/actions/articles";
import type { ContentStatus } from "@/types/database";
import { ConfirmDialog } from "./ConfirmDialog";

const iconButton =
  "h-9 w-9 rounded-lg flex items-center justify-center text-navy/60 hover:bg-section hover:text-navy transition-colors disabled:opacity-40";

export function ArticleRowActions({
  id,
  title,
  slug,
  status,
}: {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const published = status === "published";

  function toggle() {
    startTransition(async () => {
      const result = await setArticleStatus(id, published ? "draft" : "published");
      if (!result.ok) return void toast.error(result.error);
      toast.success(published ? "تم إلغاء النشر" : "تم النشر");
      router.refresh();
    });
  }

  async function remove() {
    const result = await deleteArticle(id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف المقالة");
    router.refresh();
    return true;
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      <Link href={`/admin/articles/${id}/edit` as Route} className={iconButton} aria-label={`تعديل ${title}`} title="تعديل">
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={iconButton}
        aria-label={published ? `إلغاء نشر ${title}` : `نشر ${title}`}
        title={published ? "إلغاء النشر" : "نشر"}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {published && (
        <a href={`/blog/${slug}`} target="_blank" rel="noreferrer" className={iconButton} aria-label={`عرض ${title} في الموقع`} title="عرض في الموقع">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <ConfirmDialog
        title="حذف المقالة؟"
        description={<>سيتم حذف «{title}» نهائيًا ولا يمكن التراجع عن ذلك.</>}
        onConfirm={remove}
        trigger={
          <button type="button" className={`${iconButton} hover:text-red-600`} aria-label={`حذف ${title}`} title="حذف">
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}
