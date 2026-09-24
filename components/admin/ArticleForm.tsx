"use client";

import { useState, useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Send, Save, EyeOff, Trash2, ExternalLink } from "lucide-react";
import { saveArticle, deleteArticle } from "@/lib/actions/articles";
import type { ArticleRow, ContentStatus } from "@/types/database";
import { toDateTimeLocal, fromDateTimeLocal } from "@/lib/datetime";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SlugField } from "@/components/admin/SlugField";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { useCmsForm } from "@/components/admin/useCmsForm";

function initialValues(article?: ArticleRow) {
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

function successMessage(from: ContentStatus, to: ContentStatus) {
  if (to === "published") return from === "published" ? "تم تحديث المقالة" : "تم نشر المقالة";
  return from === "published" ? "تم إلغاء النشر وحفظ المقالة كمسودة" : "تم حفظ المسودة";
}

export function ArticleForm({ article, categories }: { article?: ArticleRow; categories: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { values, set, errors, setErrors, dirty, saved, markSaved, slugProps } = useCmsForm(
    initialValues(article),
    Boolean(article)
  );
  const [status, setStatus] = useState<ContentStatus>(article?.status ?? "draft");
  const [savingAs, setSavingAs] = useState<ContentStatus | null>(null);

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
      toast.success(successMessage(status, nextStatus));
      setStatus(result.data.status);
      markSaved();

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
    markSaved(); // no unsaved-changes prompt on the way out
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

          <SlugField {...slugProps} pathPrefix="/blog" />

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

        <ContentEditor
          value={values.content}
          onChange={(html) => set("content", html)}
          error={errors.content}
          previewTitle={values.title}
          previewLead={values.excerpt}
        />
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
            hint="بتوقيت القاهرة. اتركيه فارغًا ليُضبط تلقائيًا عند النشر."
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
