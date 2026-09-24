"use client";

import { useMemo, useState, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, PencilLine, Send, Save, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { saveArticle, deleteArticle } from "@/lib/actions/articles";
import type { FieldErrors } from "@/lib/actions/result";
import type { ArticleRow, ContentStatus } from "@/types/database";
import { slugify } from "@/lib/slug";
import { htmlToText, countWords } from "@/lib/text";
import { readingTime, cn } from "@/lib/utils";
import { useUnsavedChangesWarning, toDateTimeLocal, fromDateTimeLocal } from "@/lib/hooks";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { ImageField } from "@/components/admin/media/ImageField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";

type FormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image_url: string;
  category: string;
  tags: string;
  published_at: string;
};

function initialValues(article?: ArticleRow): FormValues {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    content: article?.content ?? "",
    cover_image_url: article?.cover_image_url ?? "",
    category: article?.category ?? "",
    tags: article?.tags.join("، ") ?? "",
    published_at: toDateTimeLocal(article?.published_at ?? null),
  };
}

const parseTags = (text: string) =>
  Array.from(new Set(text.split(/[,،]/).map((t) => t.trim()).filter(Boolean)));

export function ArticleForm({ article, categories }: { article?: ArticleRow; categories: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState(() => initialValues(article));
  const [saved, setSaved] = useState(values);
  const [status, setStatus] = useState<ContentStatus>(article?.status ?? "draft");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [tab, setTab] = useState<"edit" | "preview">("edit");
  const [savingAs, setSavingAs] = useState<ContentStatus | null>(null);

  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  useUnsavedChangesWarning(dirty);

  const words = useMemo(() => countWords(htmlToText(values.content)), [values.content]);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === "title" && !slugTouched) next.slug = slugify(String(value));
      return next;
    });
    if (errors[key]) setErrors(({ [key]: _removed, ...rest }) => rest);
  }

  function submit(nextStatus: ContentStatus) {
    setSavingAs(nextStatus);
    startTransition(async () => {
      const result = await saveArticle(article?.id ?? null, {
        ...values,
        tags: parseTags(values.tags),
        status: nextStatus,
        published_at: fromDateTimeLocal(values.published_at),
      });
      setSavingAs(null);

      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }

      setErrors({});
      setStatus(result.data.status);
      setSaved(values);
      const verb = nextStatus === "published" ? (status === "published" ? "تم تحديث المقالة" : "تم نشر المقالة") : status === "published" ? "تم إلغاء النشر وحفظ المقالة كمسودة" : "تم حفظ المسودة";
      toast.success(verb);

      if (!article) router.replace(`/admin/articles/${result.data.id}/edit` as Route);
      else router.refresh();
    });
  }

  async function handleDelete() {
    if (!article) return false;
    const result = await deleteArticle(article.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف المقالة");
    setSaved(values); // no unsaved-changes prompt on the way out
    router.push("/admin/articles" as Route);
    router.refresh();
    return true;
  }

  return (
    <form onSubmit={(e) => e.preventDefault()} className="grid xl:grid-cols-[1fr_340px] gap-6 items-start" noValidate>
      <div className="space-y-6 min-w-0">
        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5">
          <Field id="title" label="العنوان" error={errors.title} required>
            <Input
              {...describedBy("title", errors.title)}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className="text-lg font-semibold"
              maxLength={200}
            />
          </Field>

          <Field
            id="slug"
            label="الرابط (slug)"
            error={errors.slug}
            hint={`يظهر في عنوان الصفحة: /blog/${values.slug || "…"}`}
            required
          >
            <div className="flex gap-2">
              <Input
                {...describedBy("slug", errors.slug, "hint")}
                value={values.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set("slug", e.target.value);
                }}
                dir="auto"
                maxLength={200}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-12 shrink-0"
                onClick={() => {
                  setSlugTouched(false);
                  set("slug", slugify(values.title));
                }}
              >
                توليد من العنوان
              </Button>
            </div>
          </Field>

          <Field id="excerpt" label="المقتطف" error={errors.excerpt} hint="ملخص قصير يظهر في بطاقات المقالات ونتائج البحث.">
            <Textarea
              {...describedBy("excerpt", errors.excerpt, "hint")}
              rows={3}
              maxLength={500}
              value={values.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
            />
          </Field>
        </div>

        <div className="rounded-2xl bg-paper p-6 border border-navy/5">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <div role="tablist" aria-label="وضع المحرر" className="inline-flex rounded-full bg-section p-1">
              {(
                [
                  { key: "edit", label: "تحرير", icon: PencilLine },
                  { key: "preview", label: "معاينة", icon: Eye },
                ] as const
              ).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 font-ui text-sm transition-colors",
                    tab === key ? "bg-navy text-white" : "text-navy/70 hover:text-navy"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
            <span className="font-ui text-xs text-navy/50">
              {words} كلمة · {readingTime(words)} دقائق قراءة
            </span>
          </div>

          <label htmlFor="content" className="sr-only">
            المحتوى
          </label>
          <div hidden={tab !== "edit"}>
            <RichTextEditor
              id="content"
              value={values.content}
              onChange={(html) => set("content", html)}
              invalid={Boolean(errors.content)}
            />
          </div>
          {tab === "preview" && (
            <article className="rounded-xl border border-navy/10 px-5 py-8 min-h-[360px]">
              <h1 className="font-display text-3xl md:text-4xl text-navy mb-4">{values.title || "بدون عنوان"}</h1>
              {values.excerpt && <p className="text-lg text-ink/90 font-medium mb-6">{values.excerpt}</p>}
              {/* Tiptap output is schema-constrained; it is sanitised again on save. */}
              <div className="rich-content" dangerouslySetInnerHTML={{ __html: values.content || "<p>لا يوجد محتوى بعد.</p>" }} />
            </article>
          )}
          {errors.content && <p className="font-ui text-sm text-red-600 mt-2">{errors.content}</p>}
        </div>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6">
        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-navy">النشر</h2>
            <StatusBadge status={status} />
          </div>

          {dirty && <p className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</p>}

          <Field
            id="published_at"
            label="تاريخ النشر"
            error={errors.published_at}
            hint="اتركيه فارغًا ليُضبط تلقائيًا عند النشر."
          >
            <Input
              {...describedBy("published_at", errors.published_at, "hint")}
              type="datetime-local"
              value={values.published_at}
              onChange={(e) => set("published_at", e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-2 pt-2">
            {status === "published" ? (
              <>
                <Button type="button" size="sm" loading={savingAs === "published"} disabled={pending} onClick={() => submit("published")}>
                  <Save className="h-4 w-4" />
                  تحديث المقالة
                </Button>
                <Button type="button" size="sm" variant="outline" loading={savingAs === "draft"} disabled={pending} onClick={() => submit("draft")}>
                  <EyeOff className="h-4 w-4" />
                  إلغاء النشر
                </Button>
              </>
            ) : (
              <>
                <Button type="button" size="sm" variant="gold" loading={savingAs === "published"} disabled={pending} onClick={() => submit("published")}>
                  <Send className="h-4 w-4" />
                  نشر
                </Button>
                <Button type="button" size="sm" variant="outline" loading={savingAs === "draft"} disabled={pending} onClick={() => submit("draft")}>
                  <Save className="h-4 w-4" />
                  حفظ كمسودة
                </Button>
              </>
            )}
            {article && status === "published" && (
              <Button href={`/blog/${saved.slug}`} size="sm" variant="ghost" className="justify-start">
                <ExternalLink className="h-4 w-4" />
                عرض في الموقع
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5">
          <ImageField
            id="cover"
            label="صورة الغلاف"
            value={values.cover_image_url}
            onChange={(url) => set("cover_image_url", url)}
            error={errors.cover_image_url}
          />

          <Field id="category" label="التصنيف" error={errors.category}>
            <Input
              {...describedBy("category", errors.category)}
              list="article-categories"
              value={values.category}
              maxLength={60}
              onChange={(e) => set("category", e.target.value)}
            />
            <datalist id="article-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>

          <Field id="tags" label="الوسوم" error={errors.tags} hint="افصلي بين الوسوم بفاصلة.">
            <Input
              {...describedBy("tags", errors.tags, "hint")}
              value={values.tags}
              onChange={(e) => set("tags", e.target.value)}
            />
          </Field>
        </div>

        {article && (
          <ConfirmDialog
            title="حذف المقالة؟"
            description={<>سيتم حذف «{article.title}» نهائيًا ولا يمكن التراجع عن ذلك.</>}
            onConfirm={handleDelete}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="text-red-600 w-full" disabled={pending}>
                <Trash2 className="h-4 w-4" />
                حذف المقالة
              </Button>
            }
          />
        )}
      </aside>
    </form>
  );
}
