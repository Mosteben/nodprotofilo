"use client";

import { Button } from "@/components/ui/Button";
import { Field, Input, describedBy } from "@/components/ui/form";

/**
 * Slug input with a "generate from title" button. The parent keeps the value and decides
 * whether to keep syncing it with the title (until the user edits the slug by hand).
 */
export function SlugField({
  value,
  error,
  pathPrefix,
  onChange,
  onGenerate,
}: {
  value: string;
  error?: string;
  pathPrefix: string;
  onChange: (slug: string) => void;
  onGenerate: () => void;
}) {
  return (
    <Field id="slug" label="الرابط (slug)" error={error} hint={`يظهر في عنوان الصفحة: ${pathPrefix}/${value || "…"}`} required>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          {...describedBy("slug", error, "hint")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="auto"
          maxLength={200}
          className="min-w-0"
        />
        <Button type="button" variant="outline" size="sm" className="h-11 sm:h-12 shrink-0" onClick={onGenerate}>
          توليد من العنوان
        </Button>
      </div>
    </Field>
  );
}
