"use client";

import { useRef, useState } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { ACCEPT_ATTRIBUTE, isAllowedImageType } from "@/lib/media";
import type { MediaRow } from "@/types/database";
import { cn } from "@/lib/utils";
import { useMediaUpload, type UploadItem } from "./useMediaUpload";
import { useImageEditor } from "./useImageEditor";

function ItemRow({ item }: { item: UploadItem }) {
  return (
    <li className="rounded-xl bg-section/70 px-4 py-3">
      <div className="flex items-center gap-3 font-ui text-sm">
        {item.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
        {item.status === "error" && <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />}
        {(item.status === "uploading" || item.status === "saving") && (
          <Loader2 className="h-4 w-4 animate-spin text-navy/50 shrink-0" />
        )}
        <span className="truncate flex-1 text-navy" dir="auto">
          {item.name}
        </span>
        <span className="text-xs text-navy/50 shrink-0">
          {item.status === "uploading" && `${Math.round(item.progress * 100)}٪`}
          {item.status === "saving" && "جارٍ الحفظ..."}
          {item.status === "done" && "تم"}
        </span>
      </div>
      {(item.status === "uploading" || item.status === "saving") && (
        <div
          className="h-1.5 rounded-full bg-navy/10 overflow-hidden mt-2"
          role="progressbar"
          aria-label={`رفع ${item.name}`}
          aria-valuenow={Math.round(item.progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${item.progress * 100}%` }} />
        </div>
      )}
      {item.error && (
        <p role="alert" className="font-ui text-xs text-red-600 mt-1">
          {item.error}
        </p>
      )}
    </li>
  );
}

/** Drop zone + file picker, optionally opening the image editor for each file before upload. */
export function MediaUploader({
  onUploaded,
  multiple = true,
}: {
  onUploaded?: (media: MediaRow) => void;
  multiple?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [editFirst, setEditFirst] = useState(true);
  const { items, upload, clearFinished } = useMediaUpload(onUploaded);
  const { edit, editor } = useImageEditor();

  async function handleFiles(list: FileList | null) {
    const files = Array.from(list ?? []).slice(0, multiple ? 20 : 1);
    for (const file of files) {
      // Allowed types open the editor even when too large — compressing them is the point.
      const ready = editFirst && isAllowedImageType(file.type) ? await edit(file) : file;
      if (ready) await upload(ready);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const finished = items.some((i) => i.status === "done" || i.status === "error");

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
          dragging ? "border-gold bg-gold/5" : "border-navy/15 bg-paper hover:border-gold"
        )}
      >
        <UploadCloud className="h-10 w-10 text-gold-dark mx-auto mb-3" />
        <p className="font-ui text-navy font-medium">اسحبي الصور هنا أو اضغطي للاختيار</p>
        <p className="font-ui text-xs text-navy/50 mt-1">JPG، PNG، WebP، GIF، AVIF — حتى 5 ميجابايت للصورة</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          multiple={multiple}
          className="sr-only"
          tabIndex={-1}
          aria-label="اختيار صور للرفع"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      <label className="flex items-center gap-2 font-ui text-sm text-navy/70 cursor-pointer w-fit">
        <input
          type="checkbox"
          checked={editFirst}
          onChange={(e) => setEditFirst(e.target.checked)}
          className="h-4 w-4 accent-[rgb(var(--color-navy))]"
        />
        تعديل الصور (قص، تدوير، تصغير، ضغط) قبل الرفع
      </label>

      {items.length > 0 && (
        <div>
          <ul className="space-y-2" aria-live="polite">
            {items.map((item) => (
              <ItemRow key={item.key} item={item} />
            ))}
          </ul>
          {finished && (
            <button type="button" onClick={clearFinished} className="mt-2 font-ui text-xs text-navy/50 hover:text-navy flex items-center gap-1">
              <X className="h-3 w-3" />
              مسح القائمة
            </button>
          )}
        </div>
      )}

      {editor}
    </div>
  );
}
