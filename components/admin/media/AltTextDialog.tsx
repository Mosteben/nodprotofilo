"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { updateMediaAlt } from "@/lib/actions/media";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/form";

export function AltTextDialog({
  id,
  initial,
  trigger,
  onSaved,
}: {
  id: string;
  initial: string;
  trigger: React.ReactNode;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [alt, setAlt] = useState(initial);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateMediaAlt(id, alt);
      if (!result.ok) return void toast.error(result.error);
      toast.success("تم حفظ النص البديل");
      setOpen(false);
      onSaved();
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy-900/60" />
        <Dialog.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-paper p-6 shadow-soft"
        >
          <Dialog.Title className="font-display text-2xl text-navy mb-4">النص البديل للصورة</Dialog.Title>
          <Field id={`alt-${id}`} label="وصف الصورة" hint="جملة قصيرة تصف محتوى الصورة لقارئات الشاشة ومحركات البحث.">
            <Textarea id={`alt-${id}`} rows={3} maxLength={300} value={alt} onChange={(e) => setAlt(e.target.value)} />
          </Field>
          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                إلغاء
              </Button>
            </Dialog.Close>
            <Button size="sm" loading={pending} onClick={save}>
              حفظ
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
