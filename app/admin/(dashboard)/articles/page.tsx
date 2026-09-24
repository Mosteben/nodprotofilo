import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ArticleRowActions } from "@/components/admin/ArticleRowActions";
import { EmptyState } from "@/components/admin/EmptyState";
import { Button } from "@/components/ui/Button";
import { formatDate, likePattern } from "@/lib/utils";

export const metadata: Metadata = { title: "المقالات" };

type SearchParams = { q?: string; status?: string; sort?: string; page?: string };

const SORTS = {
  newest: { column: "created_at", ascending: false },
  oldest: { column: "created_at", ascending: true },
  published: { column: "published_at", ascending: false },
  updated: { column: "updated_at", ascending: false },
} as const;

export default async function AdminArticlesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page);
  const sort = SORTS[params.sort as keyof typeof SORTS] ?? SORTS.newest;

  let query = supabase
    .from("articles")
    .select("id, title, slug, status, category, published_at, updated_at", { count: "exact" });
  if (params.q) query = query.ilike("title", likePattern(params.q));
  if (params.status === "draft" || params.status === "published") query = query.eq("status", params.status);

  const { data, count, error } = await query
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .range(from, to);
  if (error) throw new Error("Failed to load articles");

  const articles = data ?? [];
  const filtered = Boolean(params.q || params.status);

  return (
    <>
      <AdminPageHeader
        title="المقالات"
        description={`${count ?? 0} مقالة`}
        actions={
          <Button href="/admin/articles/new" size="sm">
            <Plus className="h-4 w-4" />
            مقالة جديدة
          </Button>
        }
      />

      <ListToolbar
        searchPlaceholder="ابحثي بعنوان المقالة..."
        filters={[
          {
            name: "status",
            label: "الحالة",
            options: [
              { value: "", label: "كل الحالات" },
              { value: "published", label: "منشورة" },
              { value: "draft", label: "مسودات" },
            ],
          },
          {
            name: "sort",
            label: "الترتيب",
            options: [
              { value: "", label: "الأحدث إنشاءً" },
              { value: "oldest", label: "الأقدم إنشاءً" },
              { value: "published", label: "تاريخ النشر" },
              { value: "updated", label: "آخر تعديل" },
            ],
          },
        ]}
      />

      {articles.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={filtered ? "لا توجد نتائج" : "لا توجد مقالات بعد"}
          description={filtered ? "جرّبي كلمات بحث أو فلاتر أخرى." : "ابدئي بكتابة أول مقالة لكِ."}
          action={
            !filtered && (
              <Button href="/admin/articles/new" size="sm">
                <Plus className="h-4 w-4" />
                مقالة جديدة
              </Button>
            )
          }
        />
      ) : (
        <div className="rounded-2xl bg-paper border border-navy/5 overflow-hidden">
          <table className="w-full font-ui text-sm">
            <thead className="bg-section/70 text-navy/60 text-start hidden md:table-header-group">
              <tr>
                <th scope="col" className="text-start font-medium px-5 py-3">العنوان</th>
                <th scope="col" className="text-start font-medium px-5 py-3">الحالة</th>
                <th scope="col" className="text-start font-medium px-5 py-3">التصنيف</th>
                <th scope="col" className="text-start font-medium px-5 py-3">تاريخ النشر</th>
                <th scope="col" className="px-5 py-3"><span className="sr-only">إجراءات</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/5">
              {articles.map((a) => (
                <tr key={a.id} className="flex flex-wrap items-center md:table-row px-4 py-3 md:p-0 hover:bg-section/40">
                  <td className="w-full md:w-auto md:px-5 md:py-4">
                    <Link href={`/admin/articles/${a.id}/edit` as Route} className="font-semibold text-navy hover:text-gold-dark">
                      {a.title}
                    </Link>
                    <span className="block text-xs text-navy/40 md:hidden mt-1">
                      {a.category ?? "بدون تصنيف"} · {formatDate(a.published_at ?? a.updated_at, "short")}
                    </span>
                  </td>
                  <td className="md:px-5 md:py-4 mt-2 md:mt-0">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="hidden md:table-cell px-5 py-4 text-navy/60">{a.category ?? "—"}</td>
                  <td className="hidden md:table-cell px-5 py-4 text-navy/60 whitespace-nowrap">
                    {a.published_at ? formatDate(a.published_at, "short") : "—"}
                  </td>
                  <td className="ms-auto md:px-5 md:py-4">
                    <ArticleRowActions id={a.id} title={a.title} slug={a.slug} status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination basePath="/admin/articles" params={params} page={page} total={count ?? 0} />
    </>
  );
}
