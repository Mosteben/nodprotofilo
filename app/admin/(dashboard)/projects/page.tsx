import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Plus, Briefcase } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ProjectRowActions } from "@/components/admin/ProjectRowActions";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { likePattern } from "@/lib/utils";

export const metadata: Metadata = { title: "المشاريع" };

type SearchParams = { q?: string; status?: string; sort?: string; page?: string };

const SORTS = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  year: { column: "year", ascending: false },
  updated: { column: "updated_at", ascending: false },
} as const;

export default async function AdminProjectsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page);
  const sort = SORTS[params.sort as keyof typeof SORTS] ?? SORTS.newest;

  let query = supabase
    .from("projects")
    .select("id, title, slug, category, year, featured, published", { count: "exact" });
  if (params.q) query = query.ilike("title", likePattern(params.q));
  if (params.status === "published") query = query.eq("published", true);
  if (params.status === "draft") query = query.eq("published", false);
  if (params.status === "featured") query = query.eq("featured", true);

  const { data, count, error } = await query
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .range(from, to);
  if (error) throw new Error("Failed to load projects");

  const projects = data ?? [];
  const filtered = Boolean(params.q || params.status);

  return (
    <>
      <AdminPageHeader
        title="المشاريع"
        description={`${count ?? 0} مشروع`}
        actions={
          <Button href="/admin/projects/new" size="sm">
            <Plus className="h-4 w-4" />
            مشروع جديد
          </Button>
        }
      />

      <ListToolbar
        searchPlaceholder="ابحثي باسم المشروع..."
        filters={[
          {
            name: "status",
            label: "الحالة",
            options: [
              { value: "", label: "كل المشاريع" },
              { value: "published", label: "منشورة" },
              { value: "draft", label: "غير منشورة" },
              { value: "featured", label: "مميّزة" },
            ],
          },
          {
            name: "sort",
            label: "الترتيب",
            options: [
              { value: "", label: "الأحدث إنشاءً" },
              { value: "oldest", label: "الأقدم إنشاءً" },
              { value: "year", label: "السنة" },
              { value: "updated", label: "آخر تعديل" },
            ],
          },
        ]}
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={filtered ? "لا توجد نتائج" : "لا توجد مشاريع بعد"}
          description={filtered ? "جرّبي كلمات بحث أو فلاتر أخرى." : "أضيفي أول مشروع لعرضه في صفحة الأعمال."}
          action={
            !filtered && (
              <Button href="/admin/projects/new" size="sm">
                <Plus className="h-4 w-4" />
                مشروع جديد
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-2xl bg-paper border border-navy/5 overflow-hidden">
          <table className="w-full font-ui text-sm">
            <thead className="bg-section/70 text-navy/60 hidden md:table-header-group">
              <tr>
                <th scope="col" className="text-start font-medium px-5 py-3">المشروع</th>
                <th scope="col" className="text-start font-medium px-5 py-3">الحالة</th>
                <th scope="col" className="text-start font-medium px-5 py-3">التصنيف</th>
                <th scope="col" className="text-start font-medium px-5 py-3">السنة</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {projects.map((p) => (
                <tr key={p.id} className="flex flex-wrap items-center md:table-row px-4 py-3 md:p-0 hover:bg-section/40">
                  <td className="w-full md:w-auto md:px-5 md:py-4">
                    <Link href={`/admin/projects/${p.id}/edit` as Route} className="font-semibold text-navy hover:text-gold-dark">
                      {p.title}
                    </Link>
                    <span className="block text-xs text-navy/40 md:hidden mt-1">
                      {[p.category, p.year].filter(Boolean).join(" · ") || "—"}
                    </span>
                  </td>
                  <td className="md:px-5 md:py-4 mt-2 md:mt-0">
                    <span className="flex gap-2">
                      <StatusBadge status={p.published ? "published" : "draft"} />
                      {p.featured && <StatusBadge status="featured" />}
                    </span>
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 text-navy/60">{p.category ?? "—"}</td>
                  <td className="hidden md:table-cell px-5 py-4 text-navy/60">{p.year ?? "—"}</td>
                  <td className="ms-auto md:px-5 md:py-4">
                    <ProjectRowActions id={p.id} title={p.title} slug={p.slug} published={p.published} featured={p.featured} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/admin/projects" params={params} page={page} total={count ?? 0} />
    </>
  );
}
