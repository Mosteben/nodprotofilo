"use client";

import { useTransition } from "react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2, Eye, EyeOff, Star, ExternalLink, Loader2 } from "lucide-react";
import { deleteProject, setProjectFlag } from "@/lib/actions/projects";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

const iconButton =
  "h-9 w-9 rounded-lg flex items-center justify-center text-navy/60 hover:bg-section hover:text-navy transition-colors disabled:opacity-40";

export function ProjectRowActions({
  id,
  title,
  slug,
  published,
  featured,
}: {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  featured: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle(flag: "published" | "featured", value: boolean, message: string) {
    startTransition(async () => {
      const result = await setProjectFlag(id, flag, value);
      if (!result.ok) return void toast.error(result.error);
      toast.success(message);
      router.refresh();
    });
  }

  async function remove() {
    const result = await deleteProject(id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف المشروع");
    router.refresh();
    return true;
  }

  return (
    <div className="flex items-center gap-1 justify-end">
      {pending && <Loader2 className="h-4 w-4 animate-spin text-navy/40" aria-label="جارٍ الحفظ" />}
      <Link href={`/admin/projects/${id}/edit` as Route} className={iconButton} aria-label={`تعديل ${title}`} title="تعديل">
        <Pencil className="h-4 w-4" />
      </Link>
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("featured", !featured, featured ? "أُزيل من المميّزة" : "أُضيف إلى المميّزة")}
        className={cn(iconButton, featured && "text-gold-dark")}
        aria-pressed={featured}
        aria-label={featured ? `إزالة ${title} من المميّزة` : `تمييز ${title}`}
        title={featured ? "إزالة التمييز" : "تمييز"}
      >
        <Star className={cn("h-4 w-4", featured && "fill-current")} />
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => toggle("published", !published, published ? "تم إلغاء النشر" : "تم النشر")}
        className={iconButton}
        aria-label={published ? `إلغاء نشر ${title}` : `نشر ${title}`}
        title={published ? "إلغاء النشر" : "نشر"}
      >
        {published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
      {published && (
        <a href={`/portfolio/${slug}`} target="_blank" rel="noreferrer" className={iconButton} aria-label={`عرض ${title} في الموقع`} title="عرض في الموقع">
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
      <ConfirmDialog
        title="حذف المشروع؟"
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
