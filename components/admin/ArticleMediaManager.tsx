"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Images, Library, Loader2, RotateCcw, Star, Trash2, TriangleAlert, X } from "lucide-react";
import { ACCEPT_ATTRIBUTE } from "@/lib/media";
import type { ArticleImageInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { ImagePickerDialog } from "@/components/admin/media/ImagePickerDialog";
import { uploadImageToLibrary } from "@/components/admin/media/useMediaUpload";

type PendingUpload = {
  key: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
};

const iconButton =
  "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center bg-paper/95 text-navy/70 shadow-sm hover:text-navy hover:bg-paper disabled:opacity-30 disabled:pointer-events-none";

/**
 * Article-level images (separate from images inside the article body). The list is part of
 * the form state and is saved with the article; the first image is the primary one.
 * Uploads go to the media library immediately and are appended to the list — existing
 * images are never replaced.
 */
export function ArticleMediaManager({
  images,
  onChange,
  onAppend,
  onBusyChange,
  error,
}: {
  images: ArticleImageInput[];
  onChange: (images: ArticleImageInput[]) => void;
  /** Appends safely even when several uploads finish at the same time. */
  onAppend: (image: ArticleImageInput) => void;
  /** True while uploads are running (the form should not be saved then). */
  onBusyChange?: (busy: boolean) => void;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingUpload[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  // Free preview URLs when the manager unmounts.
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  useEffect(() => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)), []);

  const patch = (key: string, changes: Partial<PendingUpload>) =>
    setPending((list) => list.map((p) => (p.key === key ? { ...p, ...changes } : p)));

  function dismiss(key: string) {
    setPending((list) => {
      const item = list.find((p) => p.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return list.filter((p) => p.key !== key);
    });
  }

  async function start(item: PendingUpload) {
    patch(item.key, { error: undefined, progress: 0 });
    const result = await uploadImageToLibrary(item.file, "", (progress) => patch(item.key, { progress }));
    if (!result.ok) {
      patch(item.key, { error: result.error });
      return;
    }
    onAppend({ image_url: result.media.file_url, media_id: result.media.id, storage_path: result.media.file_path, alt_text: "" });
    dismiss(item.key);
  }

  function addFiles(list: FileList | null) {
    const items = Array.from(list ?? []).map((file) => ({
      key: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));
    if (inputRef.current) inputRef.current.value = "";
    if (items.length === 0) return;
    setPending((current) => [...current, ...items]);
    // Uploads run in parallel; each finished image is appended in completion order.
    items.forEach((item) => void start(item));
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  }

  const uploading = pending.some((p) => !p.error);
  useEffect(() => onBusyChange?.(uploading), [uploading, onBusyChange]);

  return (
    <section aria-labelledby="article-media-heading" className="rounded-2xl bg-paper p-4 sm:p-6 border border-navy/5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h2 id="article-media-heading" className="font-display text-xl text-navy flex items-center gap-2">
            <Images className="h-5 w-5 text-gold-dark" />
            صور المقالة
            {images.length > 0 && <span className="font-ui text-sm text-navy/40">({images.length})</span>}
          </h2>
          <p className="font-ui text-xs text-navy/50 mt-1">الصورة الأولى هي الصورة الرئيسية. رتّبي بالأسهم أو بالسحب، ثم احفظي المقالة.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => inputRef.current?.click()}>
            <ImagePlus className="h-4 w-4" />
            إضافة صور
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setPickerOpen(true)}>
            <Library className="h-4 w-4" />
            من المكتبة
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple
          className="sr-only"
          tabIndex={-1}
          aria-label="اختيار صور للمقالة"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {images.length === 0 && pending.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-navy/15 bg-section py-10 px-4 flex flex-col items-center gap-2 text-navy/50 hover:border-gold hover:text-gold-dark transition-colors"
        >
          <ImagePlus className="h-8 w-8" />
          <span className="font-ui text-sm">لا توجد صور بعد — اضغطي لاختيار صورة أو أكثر</span>
        </button>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" aria-label="صور المقالة">
          {images.map((image, index) => (
            <li
              key={`${image.image_url}-${index}`}
              draggable
              onDragStart={(e) => {
                setDragIndex(index);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, index);
                setDragIndex(null);
              }}
              onDragEnd={() => setDragIndex(null)}
              className={cn(
                "min-w-0 rounded-xl border bg-section overflow-hidden",
                index === 0 ? "border-gold" : "border-navy/10",
                dragIndex === index && "opacity-50"
              )}
            >
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element -- admin preview from any configured source */}
                <img src={image.image_url} alt={image.alt_text || `صورة ${index + 1}`} loading="lazy" className="h-full w-full object-cover" draggable={false} />
                {index === 0 && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 font-ui text-[11px] font-semibold text-navy">
                    <Star className="h-3 w-3 fill-current" /> الرئيسية
                  </span>
                )}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1">
                  <div className="flex gap-1">
                    <button type="button" className={iconButton} disabled={index === 0} onClick={() => move(index, index - 1)} aria-label={`تقديم الصورة ${index + 1}`} title="تقديم">
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button type="button" className={iconButton} disabled={index === images.length - 1} onClick={() => move(index, index + 1)} aria-label={`تأخير الصورة ${index + 1}`} title="تأخير">
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className={`${iconButton} hover:text-red-600`}
                    onClick={() => onChange(images.filter((_, i) => i !== index))}
                    aria-label={`إزالة الصورة ${index + 1} من المقالة`}
                    title="إزالة من المقالة"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <label className="sr-only" htmlFor={`image-alt-${index}`}>
                وصف الصورة {index + 1}
              </label>
              <input
                id={`image-alt-${index}`}
                value={image.alt_text ?? ""}
                maxLength={300}
                placeholder="وصف الصورة (اختياري)"
                onChange={(e) => onChange(images.map((img, i) => (i === index ? { ...img, alt_text: e.target.value } : img)))}
                className="block w-full min-w-0 bg-paper px-3 py-2 font-ui text-xs text-ink placeholder:text-navy/35 outline-none border-t border-navy/10 focus-visible:bg-gold/5"
              />
            </li>
          ))}

          {pending.map((item) => (
            <li key={item.key} className={cn("min-w-0 rounded-xl border overflow-hidden bg-section", item.error ? "border-red-300" : "border-navy/10")}>
              <div className="relative aspect-[4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview before upload */}
                <img src={item.preview} alt="" className={cn("h-full w-full object-cover", !item.error && "opacity-60")} />
                {item.error ? (
                  <div className="absolute inset-0 bg-red-50/90 p-2 flex flex-col items-center justify-center gap-2 text-center">
                    <TriangleAlert className="h-5 w-5 text-red-600" />
                    <p role="alert" className="font-ui text-[11px] leading-snug text-red-700 line-clamp-3">
                      {item.error}
                    </p>
                    <div className="flex gap-1">
                      <button type="button" className={iconButton} onClick={() => void start(item)} aria-label={`إعادة رفع ${item.file.name}`} title="إعادة المحاولة">
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button type="button" className={iconButton} onClick={() => dismiss(item.key)} aria-label={`تجاهل ${item.file.name}`} title="تجاهل">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2" role="status" aria-label={`جارٍ رفع ${item.file.name}`}>
                    <Loader2 className="h-6 w-6 animate-spin text-navy" />
                    <div className="h-1.5 w-3/4 rounded-full bg-navy/15 overflow-hidden">
                      <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${Math.round(item.progress * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
              <p className="px-3 py-2 font-ui text-xs text-navy/50 truncate border-t border-navy/10 bg-paper" dir="auto">
                {item.file.name}
              </p>
            </li>
          ))}

          <li className="min-w-0">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="h-full min-h-[120px] w-full rounded-xl border-2 border-dashed border-navy/15 flex flex-col items-center justify-center gap-1 text-navy/50 hover:border-gold hover:text-gold-dark transition-colors"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="font-ui text-xs">إضافة صور</span>
            </button>
          </li>
        </ul>
      )}

      {uploading && (
        <p role="status" className="font-ui text-xs text-navy/60 mt-3">
          جارٍ رفع الصور… انتظري انتهاء الرفع قبل حفظ المقالة.
        </p>
      )}
      {error && (
        <p role="alert" className="font-ui text-sm text-red-600 mt-3">
          {error}
        </p>
      )}
      <p className="font-ui text-[11px] text-navy/40 mt-3">
        إزالة صورة تفصلها عن هذه المقالة فقط؛ يبقى الملف في مكتبة الوسائط ويمكن حذفه نهائيًا من هناك.
      </p>

      <ImagePickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title="إضافة صورة من المكتبة"
        onSelect={({ url, alt }) => onAppend({ image_url: url, media_id: null, storage_path: null, alt_text: alt })}
      />
    </section>
  );
}
