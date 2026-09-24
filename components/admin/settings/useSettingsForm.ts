"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ActionResult, FieldErrors } from "@/lib/actions/result";
import { useUnsavedChangesWarning } from "@/lib/hooks";

/** Values, field errors, dirty tracking and a save handler for the settings forms. */
export function useSettingsForm<T extends object>(
  initial: T,
  action: (values: T) => Promise<ActionResult>,
  successMessage: string
) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChangesWarning(dirty);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function submit() {
    startTransition(async () => {
      const result = await action(values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      setSaved(values);
      toast.success(successMessage);
      router.refresh();
    });
  }

  return { values, setValues, set, errors, pending, dirty, submit };
}
