"use client";

import { useState } from "react";
import type { FieldErrors } from "@/lib/actions/result";
import { slugify } from "@/lib/slug";
import { useUnsavedChangesWarning } from "@/lib/hooks";

/**
 * Shared state for article/project forms: field values, per-field errors, dirty tracking
 * (with a leave-page warning) and a slug that follows the title until edited by hand.
 */
export function useCmsForm<T extends { title: string; slug: string }>(initial: T, existing: boolean) {
  const [values, setValues] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(existing);
  const [errors, setErrors] = useState<FieldErrors>({});

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChangesWarning(dirty);

  function set<K extends keyof T>(key: K, value: T[K]) {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key as string]) {
      setErrors((current) => {
        const rest = { ...current };
        delete rest[key as string];
        return rest;
      });
    }
  }

  return {
    values,
    set,
    errors,
    setErrors,
    dirty,
    saved,
    /** Call after a successful save. */
    markSaved: () => setSaved(values),
    slugProps: {
      value: values.slug,
      error: errors.slug,
      onChange: (slug: string) => {
        setSlugTouched(true);
        set("slug", slug);
      },
      onGenerate: () => {
        setSlugTouched(false);
        set("slug", slugify(values.title));
      },
    },
  };
}
