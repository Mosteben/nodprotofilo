"use client";

import { useState, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2, ExternalLink } from "lucide-react";
import { COLLECTIONS, type CollectionKey, type FieldDef } from "@/lib/collections";
import { deleteCollectionItem, saveCollectionItem } from "@/lib/actions/collections";
import type { FieldErrors } from "@/lib/actions/result";
import { slugify } from "@/lib/slug";
import { youTubeWatchUrl } from "@/lib/youtube";
import { toEditorHtml } from "@/lib/text";
import { useUnsavedChangesWarning } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { SlugField } from "@/components/admin/SlugField";
import { ResourceFileField } from "./ResourceFileField";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Values = Record<string, string | boolean>;
type Row = Record<string, unknown>;

const FILE_COLUMNS = ["file_path", "file_url", "file_name", "mime_type", "file_size"] as const;

function initialValues(key: CollectionKey, item: Row | null): Values {
  const def = COLLECTIONS[key];
  const values: Values = {};
  for (const field of [...def.main, ...def.side]) {
    const raw = item?.[field.name];
    if (field.type === "checkbox") values[field.name] = Boolean(raw);
    else if (field.type === "youtube") values[field.name] = raw ? youTubeWatchUrl(String(raw)) : "";
    else if (field.type === "richtext") values[field.name] = toEditorHtml(raw == null ? "" : String(raw));
    else if (field.type === "file" && field.mode === "record") {
      for (const column of FILE_COLUMNS) values[column] = item?.[column] == null ? "" : String(item[column]);
    } else values[field.name] = raw == null ? "" : String(raw);
  }
  return values;
}

export function CollectionForm({
  collection,
  item,
  suggestions,
}: {
  collection: CollectionKey;
  item: Row | null;
  suggestions: Record<string, string[]>;
}) {
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(() => initialValues(collection, item));
  const [saved, setSaved] = useState(values);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [slugTouched, setSlugTouched] = useState(Boolean(item));
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChangesWarning(dirty);

  const itemId = item?.id as string | undefined;
  const basePath = `/admin/${collection}`;

  function set(name: string, value: string | boolean) {
    setValues((current) => {
      const next = { ...current, [name]: value };
      if (def.hasSlug && name === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    clearError(name);
  }

  function clearError(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const rest = { ...current };
      delete rest[name];
      return rest;
    });
  }

  function submit() {
    startTransition(async () => {
      const result = await saveCollectionItem(collection, itemId ?? null, values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      setSaved(values);
      toast.success(itemId ? "تم حفظ التعديلات" : `تمت إضافة ${def.itemLabel}`);
      if (!itemId) router.replace(`${basePath}/${result.data.id}/edit` as Route);
      else router.refresh();
    });
  }

  async function remove() {
    if (!itemId) return false;
    const result = await deleteCollectionItem(collection, itemId);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم الحذف");
    setSaved(values);
    router.push(basePath as Route);
    router.refresh();
    return true;
  }

  function renderField(field: FieldDef) {
    const value = values[field.name];
    const error = errors[field.name];
    switch (field.type) {
      case "checkbox":
        return (
          <Checkbox
            key={field.name}
            id={field.name}
            label={field.label}
            description={field.description}
            checked={Boolean(value)}
            onChange={(e) => set(field.name, e.target.checked)}
          />
        );
      case "image":
        return (
          <div key={field.name}>
            <ImageField id={field.name} label={field.label} value={String(value)} onChange={(url) => set(field.name, url)} error={error} aspect={field.aspect} />
            {field.hint && !error && <p className="font-ui text-xs text-navy/50 mt-1">{field.hint}</p>}
          </div>
        );
      case "slug":
        return (
          <SlugField
            key={field.name}
            value={String(value)}
            error={error}
            pathPrefix={field.prefix}
            onChange={(slug) => {
              setSlugTouched(true);
              set("slug", slug);
            }}
            onGenerate={() => {
              setSlugTouched(false);
              set("slug", slugify(String(values.title)));
            }}
          />
        );
      case "file":
        if (field.mode === "record") {
          const current = values.file_path
            ? { name: String(values.file_name || "ملف"), url: String(values.file_url), mime: String(values.mime_type), size: Number(values.file_size) || undefined }
            : null;
          return (
            <ResourceFileField
              key={field.name}
              id={field.name}
              label={field.label}
              hint={field.hint}
              error={errors.file ?? errors.file_path}
              current={current}
              onUploaded={(file) => {
                setValues((v) => ({ ...v, ...file }));
                clearError("file");
              }}
              onClear={() => setValues((v) => ({ ...v, ...Object.fromEntries(FILE_COLUMNS.map((c) => [c, ""])) }))}
            />
          );
        }
        return (
          <div key={field.name} className="space-y-3">
            <ResourceFileField
              id={`${field.name}-upload`}
              label={field.label}
              hint={field.hint}
              current={value ? { name: String(value).split("/").pop() || String(value), url: String(value) } : null}
              onUploaded={(file) => set(field.name, file.file_url)}
              onClear={() => set(field.name, "")}
            />
            <Field id={field.name} label="أو رابط" error={error}>
              <Input {...describedBy(field.name, error)} dir="ltr" placeholder="https://…" value={String(value)} onChange={(e) => set(field.name, e.target.value)} />
            </Field>
          </div>
        );
      case "youtube":
        return (
          <Field key={field.name} id={field.name} label={field.label} hint={field.hint} error={error}>
            <Input {...describedBy(field.name, error, field.hint)} dir="ltr" placeholder="https://www.youtube.com/watch?v=…" value={String(value)} onChange={(e) => set(field.name, e.target.value)} />
          </Field>
        );
      case "richtext":
        return (
          <div key={field.name} className="space-y-2">
            <p id={`${field.name}-label`} className="font-ui text-sm font-medium text-navy">
              {field.label}
            </p>
            <RichTextEditor
              id={field.name}
              value={String(value)}
              onChange={(html) => set(field.name, html)}
              invalid={Boolean(error)}
              minHeight="min-h-[240px]"
              ariaLabel={field.label}
              placeholder="اكتبي الوصف…"
            />
            {error ? (
              <p role="alert" className="font-ui text-sm text-red-600">
                {error}
              </p>
            ) : (
              field.hint && <p className="font-ui text-xs text-navy/50">{field.hint}</p>
            )}
          </div>
        );
      case "textarea":
        return (
          <Field key={field.name} id={field.name} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Textarea {...describedBy(field.name, error, field.hint)} rows={5} maxLength={field.maxLength} value={String(value)} onChange={(e) => set(field.name, e.target.value)} />
          </Field>
        );
      default: {
        const listId = field.suggest ? `${field.name}-options` : undefined;
        return (
          <Field key={field.name} id={field.name} label={field.label} hint={field.hint} error={error} required={field.required}>
            <Input
              {...describedBy(field.name, error, field.hint)}
              type={field.type === "number" ? "text" : field.type === "url" ? "url" : field.type}
              inputMode={field.type === "number" ? "numeric" : undefined}
              dir={field.ltr ? "ltr" : undefined}
              maxLength={field.maxLength}
              placeholder={field.placeholder}
              list={listId}
              value={String(value)}
              onChange={(e) => set(field.name, e.target.value)}
            />
            {listId && (
              <datalist id={listId}>
                {(suggestions[field.name] ?? []).map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            )}
          </Field>
        );
      }
    }
  }

  const publicHref = itemId && saved.published ? def.publicPath({ ...item, slug: saved.slug }) : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid xl:grid-cols-[1fr_340px] gap-6 items-start"
      noValidate
    >
      <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5 min-w-0">{def.main.map(renderField)}</div>

      <aside className="space-y-6 xl:sticky xl:top-6">
        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5">
          {def.side.map(renderField)}
          {dirty && <p className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</p>}
          <div className="flex flex-col gap-2">
            <Button type="submit" size="sm" loading={pending}>
              <Save className="h-4 w-4" />
              {itemId ? "حفظ التعديلات" : `إضافة ${def.itemLabel}`}
            </Button>
            {publicHref && (
              <Button href={publicHref} size="sm" variant="ghost" className="justify-start">
                <ExternalLink className="h-4 w-4" />
                عرض في الموقع
              </Button>
            )}
          </div>
        </div>
        {itemId && (
          <ConfirmDialog
            title={`حذف ${def.itemLabel}؟`}
            description={collection === "resources" ? "سيتم حذف المورد وملفه المرفوع نهائيًا." : "سيتم الحذف نهائيًا ولا يمكن التراجع."}
            onConfirm={remove}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="text-red-600 w-full" disabled={pending}>
                <Trash2 className="h-4 w-4" />
                حذف
              </Button>
            }
          />
        )}
      </aside>
    </form>
  );
}
