"use client";

import { useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowUp, ArrowDown, Pencil, Trash2, Eye, EyeOff, Star, ExternalLink, Loader2 } from "lucide-react";
import type { CollectionKey } from "@/lib/collections";
import { deleteCollectionItem, moveCollectionItem, setCollectionFlag } from "@/lib/actions/collections";
import type { ActionResult } from "@/lib/actions/result";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

const iconButton =
  "h-9 w-9 rounded-lg flex items-center justify-center text-navy/60 hover:bg-section hover:text-navy transition-colors disabled:opacity-30";

export function CollectionRowActions({
  collection,
  id,
  name,
  published,
  featured,
  canFeature,
  publicHref,
  isFirst,
  isLast,
}: {
  collection: CollectionKey;
  id: string;
  name: string;
  published: boolean;
  featured: boolean;
  canFeature: boolean;
  publicHref: string | null;
  isFirst: boolean;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(action: () => Promise<ActionResult>, success?: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) return void toast.error(result.error);
      if (success) toast.success(success);
      router.refresh();
    });
  }

  async function remove() {
    const result = await deleteCollectionItem(collection, id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم الحذف");
    router.refresh();
    return true;
  }

  return (
    <div className="flex items-center gap-0.5 justify-end flex-wrap">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-navy/40 mx-1" aria-label="جارٍ الحفظ" />}
      <button type="button" className={iconButton} disabled={pending || isFirst} onClick={() => run(() => moveCollectionItem(collection, id, "up"))} aria-label={`تحريك ${name} لأعلى`} title="لأعلى">
        <ArrowUp className="h-4 w-4" />
      </button>
      <button type="button" className={iconButton} disabled={pending || isLast} onClick={() => run(() => moveCollectionItem(collection, id, "down"))} aria-label={`تحريك ${name} لأسفل`} title="لأسفل">
        <ArrowDown className="h-4 w-4" />
      </button>
      {canFeature && (
        <button
          type="button"
          className={cn(iconButton, featured && "text-gold-dark")}
          disabled={pending}
          aria-pressed={featured}
          onClick={() => run(() => setCollectionFlag(collection, id, "featured", !featured), featured ? "أُزيل من المميّزة" : "أُضيف إلى المميّزة")}
          aria-label={featured ? `إزالة ${name} من المميّزة` : `تمييز ${name}`}
          title={featured ? "إزالة التمييز" : "تمييز"}
        >
          <Star className={cn("h-4 w-4", featured && "fill-current")} />
        </button>
      )}
      <button
        type="button"
        className={iconButton}
        disabled={pending}
        onClick={() => run(() => setCollectionFlag(collection, id, "published", !published), published ? "تم إلغاء النشر" : "تم النشر")}
        aria-label={published ? `إلغاء نشر ${name}` : `نشر ${name}`}
        title={published ? "إلغاء النشر" : "نشر"}
      >
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {publicHref && (
        <a href={publicHref} target="_blank" rel="noreferrer" className={iconButton} aria-label={`عرض ${name} في الموقع`} title="عرض في الموقع">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <Link href={`/admin/${collection}/${id}/edit` as Route} className={iconButton} aria-label={`تعديل ${name}`} title="تعديل">
        <Pencil className="h-4 w-4" />
      </Link>
      <ConfirmDialog
        title="تأكيد الحذف"
        description={<>سيتم حذف «{name}» نهائيًا ولا يمكن التراجع.</>}
        onConfirm={remove}
        trigger={
          <button type="button" className={`${iconButton} hover:text-red-600`} aria-label={`حذف ${name}`} title="حذف">
            <Trash2 className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}
