"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Tabs from "@radix-ui/react-tabs";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, describedBy } from "@/components/ui/form";
import { MediaLibraryBrowser } from "./MediaLibraryBrowser";
import { MediaUploader } from "./MediaUploader";

export type PickedImage = { url: string; alt: string };

function UrlTab({ onPick }: { onPick: (image: PickedImage) => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");

  function submit() {
    const value = url.trim();
    if (!/^https:\/\/[^\s]+$/i.test(value) && !/^\/[^/\s]/.test(value)) {
      setError("أدخلي رابط صورة يبدأ بـ https://");
      return;
    }
    onPick({ url: value, alt: alt.trim() });
  }

  return (
    <div className="space-y-4">
      <Field id="picker-url" label="رابط الصورة" error={error} required>
        <Input
          {...describedBy("picker-url", error)}
          dir="ltr"
          value={url}
          placeholder="https://…"
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
        />
      </Field>
      <Field id="picker-alt" label="نص بديل (وصف الصورة)" hint="يساعد قارئات الشاشة ومحركات البحث.">
        <Input {...describedBy("picker-alt", undefined, "hint")} value={alt} onChange={(e) => setAlt(e.target.value)} />
      </Field>
      <div className="flex justify-end">
        <Button type="button" size="sm" onClick={submit}>
          إدراج
        </Button>
      </div>
    </div>
  );
}

const tabClass =
  "px-4 py-2 rounded-full font-ui text-sm text-navy/70 data-[state=active]:bg-navy data-[state=active]:text-white transition-colors";

/** Choose an image from the media library, upload a new one, or paste a URL. */
export function ImagePickerDialog({
  open,
  onOpenChange,
  onSelect,
  title = "اختيار صورة",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (image: PickedImage) => void;
  title?: string;
}) {
  function pick(image: PickedImage) {
    onSelect(image);
    onOpenChange(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy-900/60" />
        <Dialog.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-paper p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="font-display text-2xl text-navy">{title}</Dialog.Title>
            <Dialog.Close className="h-9 w-9 rounded-full flex items-center justify-center text-navy/60 hover:bg-section" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <Tabs.Root defaultValue="library" dir="rtl">
            <Tabs.List aria-label="مصدر الصورة" className="inline-flex rounded-full bg-section p-1 mb-5">
              <Tabs.Trigger value="library" className={tabClass}>
                المكتبة
              </Tabs.Trigger>
              <Tabs.Trigger value="upload" className={tabClass}>
                رفع
              </Tabs.Trigger>
              <Tabs.Trigger value="url" className={tabClass}>
                رابط
              </Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="library">
              <MediaLibraryBrowser onPick={(m) => pick({ url: m.file_url, alt: m.alt_text ?? "" })} />
            </Tabs.Content>
            <Tabs.Content value="upload">
              <MediaUploader multiple={false} onUploaded={(m) => pick({ url: m.file_url, alt: m.alt_text ?? "" })} />
            </Tabs.Content>
            <Tabs.Content value="url">
              <UrlTab onPick={pick} />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
