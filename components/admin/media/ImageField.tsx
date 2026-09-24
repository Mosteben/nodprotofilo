"use client";

import { useState } from "react";
import { ImageIcon, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ImagePickerDialog } from "./ImagePickerDialog";

/** Cover-image style field: preview + choose/replace/remove, storing only the URL. */
export function ImageField({
  id,
  label,
  value,
  onChange,
  error,
  aspect = "aspect-[16/9]",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  aspect?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <p id={`${id}-label`} className="font-ui text-sm font-medium text-navy">
        {label}
      </p>
      {value ? (
        <div className={`relative ${aspect} rounded-xl overflow-hidden border border-navy/10 bg-section`}>
          {/* Plain <img>: admin previews may point to hosts not configured for next/image. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-labelledby={`${id}-label`}
          className={`${aspect} w-full rounded-xl border-2 border-dashed border-navy/15 bg-section flex flex-col items-center justify-center gap-2 text-navy/50 hover:border-gold hover:text-gold-dark transition-colors`}
        >
          <ImageIcon className="h-8 w-8" />
          <span className="font-ui text-sm">اختيار صورة</span>
        </button>
      )}
      {value && (
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
            <RefreshCw className="h-4 w-4" />
            تغيير
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange("")} className="text-red-600">
            <Trash2 className="h-4 w-4" />
            إزالة
          </Button>
        </div>
      )}
      {error && (
        <p role="alert" className="font-ui text-sm text-red-600">
          {error}
        </p>
      )}
      <ImagePickerDialog open={open} onOpenChange={setOpen} onSelect={({ url }) => onChange(url)} title={label} />
    </div>
  );
}
