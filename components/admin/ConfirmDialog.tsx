"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Confirmation modal for destructive actions. `onConfirm` may be async; the dialog stays
 * open with a spinner until it resolves, and closes only when it returns true.
 */
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "حذف",
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleConfirm() {
    setPending(true);
    const done = await onConfirm();
    setPending(false);
    if (done) setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !pending && setOpen(next)}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[90] bg-navy-900/60 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          dir="rtl"
          className="fixed z-[91] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-md rounded-2xl bg-paper p-6 shadow-soft data-[state=open]:animate-in data-[state=open]:zoom-in-95"
        >
          <div className="flex gap-4">
            <span className="h-11 w-11 shrink-0 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <div>
              <Dialog.Title className="font-display text-2xl text-navy mb-2">{title}</Dialog.Title>
              <Dialog.Description className="font-ui text-sm text-navy/70 leading-relaxed">
                {description}
              </Dialog.Description>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Dialog.Close asChild>
              <Button variant="outline" size="sm" disabled={pending}>
                إلغاء
              </Button>
            </Dialog.Close>
            <Button variant="danger" size="sm" loading={pending} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
