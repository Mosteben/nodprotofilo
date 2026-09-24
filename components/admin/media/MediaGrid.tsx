"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, Trash2, Type, Crop, Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteMedia } from "@/lib/actions/media";
import type { MediaRow } from "@/types/database";
import { formatFileSize } from "@/lib/utils";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { AltTextDialog } from "./AltTextDialog";
import { useImageEditor } from "./useImageEditor";
import { useMediaUpload } from "./useMediaUpload";

const action =
  "h-9 w-9 rounded-lg flex items-center justify-center bg-paper/90 text-navy/70 hover:text-navy hover:bg-paper shadow-sm transition-colors";

export function MediaGrid({ media }: { media: MediaRow[] }) {
  const router = useRouter();
  const { editUrl, editor } = useImageEditor();
  const { upload } = useMediaUpload();
  const [editingId, setEditingId] = useState<string | null>(null);

  /** Edits an image and saves the result as a new file, keeping the original. */
  async function editCopy(item: MediaRow) {
    setEditingId(item.id);
    try {
      const file = await editUrl(item.file_url, item.file_name);
      if (!file) return;
      const saved = await upload(file, item.alt_text ?? "");
      if (saved) {
        toast.success("تم حفظ نسخة معدّلة من الصورة");
        router.refresh();
      } else {
        toast.error("تعذّر حفظ الصورة المعدّلة.");
      }
    } catch {
      toast.error("تعذّر فتح الصورة للتعديل.");
    } finally {
      setEditingId(null);
    }
  }

  async function copy(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("تم نسخ رابط الصورة");
    } catch {
      toast.error("تعذّر النسخ — انسخي الرابط يدويًا.");
    }
  }

  async function remove(id: string) {
    const result = await deleteMedia(id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف الصورة");
    router.refresh();
    return true;
  }

  return (
    <>
      <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 gap-4">
        {media.map((item) => (
          <li key={item.id} className="group rounded-2xl bg-paper border border-navy/5 overflow-hidden">
            <div className="relative aspect-square bg-section">
              {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails straight from storage */}
              <img src={item.file_url} alt={item.alt_text ?? ""} loading="lazy" className="h-full w-full object-cover" />
              <div className="absolute top-2 left-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                <button
                  type="button"
                  className={action}
                  onClick={() => void editCopy(item)}
                  disabled={editingId !== null}
                  aria-label={`تعديل ${item.file_name}`}
                  title="تعديل (يُحفظ كنسخة جديدة)"
                >
                  {editingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crop className="h-4 w-4" />}
                </button>
                <button type="button" className={action} onClick={() => copy(item.file_url)} aria-label={`نسخ رابط ${item.file_name}`} title="نسخ الرابط">
                  <Copy className="h-4 w-4" />
                </button>
                <AltTextDialog
                  id={item.id}
                  initial={item.alt_text ?? ""}
                  onSaved={() => router.refresh()}
                  trigger={
                    <button type="button" className={action} aria-label={`تعديل النص البديل لـ ${item.file_name}`} title="النص البديل">
                      <Type className="h-4 w-4" />
                    </button>
                  }
                />
                <ConfirmDialog
                  title="حذف الصورة؟"
                  description="سيتم حذف الصورة من التخزين نهائيًا. أي مقالة أو مشروع يستخدمها سيفقد هذه الصورة."
                  onConfirm={() => remove(item.id)}
                  trigger={
                    <button type="button" className={`${action} hover:text-red-600`} aria-label={`حذف ${item.file_name}`} title="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  }
                />
              </div>
            </div>
            <div className="p-3 font-ui">
              <p className="text-xs text-navy truncate" dir="auto" title={item.file_name}>
                {item.file_name}
              </p>
              <p className="text-[11px] text-navy/40">
                {formatFileSize(item.size)}
                {item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
                {!item.alt_text && <span className="text-amber-600"> · بدون نص بديل</span>}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {editor}
    </>
  );
}
