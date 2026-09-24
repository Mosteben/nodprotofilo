"use client";

import { useTransition } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Trash2, ExternalLink } from "lucide-react";
import { saveProject, deleteProject } from "@/lib/actions/projects";
import type { ProjectRow } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Textarea, describedBy } from "@/components/ui/form";
import { ImageField } from "@/components/admin/media/ImageField";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SlugField } from "@/components/admin/SlugField";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { useCmsForm } from "@/components/admin/useCmsForm";

function initialValues(project?: ProjectRow) {
  return {
    title: project?.title ?? "",
    slug: project?.slug ?? "",
    description: project?.description ?? "",
    content: project?.content ?? "",
    cover_image_url: project?.cover_image_url ?? "",
    category: project?.category ?? "",
    client: project?.client ?? "",
    year: project?.year ? String(project.year) : "",
    project_url: project?.project_url ?? "",
    github_url: project?.github_url ?? "",
    featured: project?.featured ?? false,
    published: project?.published ?? false,
  };
}

export function ProjectForm({ project, categories }: { project?: ProjectRow; categories: string[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { values, set, errors, setErrors, dirty, saved, markSaved, slugProps } = useCmsForm(
    initialValues(project),
    Boolean(project)
  );

  function submit() {
    startTransition(async () => {
      const result = await saveProject(project?.id ?? null, values);
      if (!result.ok) {
        setErrors(result.fieldErrors ?? {});
        toast.error(result.error);
        return;
      }
      setErrors({});
      markSaved();
      toast.success(project ? "تم حفظ التعديلات" : "تم إنشاء المشروع");
      if (!project) router.replace(`/admin/projects/${result.data.id}/edit` as Route);
      else router.refresh();
    });
  }

  async function handleDelete() {
    if (!project) return false;
    const result = await deleteProject(project.id);
    if (!result.ok) {
      toast.error(result.error);
      return false;
    }
    toast.success("تم حذف المشروع");
    markSaved();
    router.push("/admin/projects" as Route);
    router.refresh();
    return true;
  }

  const text = (key: "client" | "project_url" | "github_url" | "year", label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <Field id={key} label={label} error={errors[key]}>
      <Input {...describedBy(key, errors[key])} value={values[key]} onChange={(e) => set(key, e.target.value)} {...props} />
    </Field>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="grid xl:grid-cols-[1fr_340px] gap-6 items-start"
      noValidate
    >
      <div className="space-y-6 min-w-0">
        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-5">
          <Field id="title" label="اسم المشروع" error={errors.title} required>
            <Input
              {...describedBy("title", errors.title)}
              value={values.title}
              onChange={(e) => set("title", e.target.value)}
              className="text-lg font-semibold"
              maxLength={200}
            />
          </Field>

          <SlugField {...slugProps} pathPrefix="/portfolio" />

          <Field id="description" label="وصف مختصر" error={errors.description} hint="يظهر في بطاقة المشروع ونتائج البحث.">
            <Textarea
              {...describedBy("description", errors.description, "hint")}
              rows={3}
              maxLength={500}
              value={values.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>
        </div>

        <ContentEditor
          value={values.content}
          onChange={(html) => set("content", html)}
          error={errors.content}
          previewTitle={values.title}
          previewLead={values.description}
        />
      </div>

      <aside className="space-y-6 xl:sticky xl:top-6">
        <div className="rounded-2xl bg-paper p-6 border border-navy/5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-xl text-navy">النشر</h2>
            <span className="flex gap-2">
              {saved.featured && <StatusBadge status="featured" />}
              <StatusBadge status={saved.published ? "published" : "draft"} />
            </span>
          </div>
          {dirty && <p className="font-ui text-xs text-amber-700">لديكِ تغييرات غير محفوظة.</p>}

          <Checkbox
            id="published"
            label="منشور"
            description="يظهر في صفحة الأعمال."
            checked={values.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          <Checkbox
            id="featured"
            label="مشروع مميّز"
            description="يظهر في الصفحة الرئيسية (إذا كان منشورًا)."
            checked={values.featured}
            onChange={(e) => set("featured", e.target.checked)}
          />

          <div className="flex flex-col gap-2 pt-2">
            <Button type="submit" size="sm" loading={pending}>
              <Save className="h-4 w-4" />
              {project ? "حفظ التعديلات" : "إنشاء المشروع"}
            </Button>
            {project && saved.published && (
              <Button href={`/portfolio/${saved.slug}`} size="sm" variant="ghost" className="justify-start">
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
              list="project-categories"
              value={values.category}
              maxLength={60}
              onChange={(e) => set("category", e.target.value)}
            />
            <datalist id="project-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          {text("client", "العميل / الجهة", { maxLength: 120 })}
          {text("year", "السنة", { inputMode: "numeric", maxLength: 4, dir: "ltr", placeholder: "2026" })}
          {text("project_url", "رابط المشروع", { dir: "ltr", placeholder: "https://…", type: "url" })}
          {text("github_url", "رابط GitHub", { dir: "ltr", placeholder: "https://github.com/…", type: "url" })}
        </div>

        {project && (
          <ConfirmDialog
            title="حذف المشروع؟"
            description={<>سيتم حذف «{project.title}» نهائيًا ولا يمكن التراجع عن ذلك.</>}
            onConfirm={handleDelete}
            trigger={
              <Button type="button" variant="ghost" size="sm" className="text-red-600 w-full" disabled={pending}>
                <Trash2 className="h-4 w-4" />
                حذف المشروع
              </Button>
            }
          />
        )}
      </aside>
    </form>
  );
}
