import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { orIlikeFilter } from "@/lib/utils";
import type { CommentContentType } from "@/types/database";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { CommentRow, type ModerationComment } from "@/components/admin/CommentRow";

export const metadata: Metadata = { title: "التعليقات" };

type SearchParams = { q?: string; status?: string; type?: string; page?: string };

const TYPES: Record<CommentContentType, { label: string; table: "articles" | "projects" | "books" | "lectures"; path: string }> = {
  article: { label: "مقالة", table: "articles", path: "/blog" },
  project: { label: "مشروع", table: "projects", path: "/portfolio" },
  book: { label: "كتاب", table: "books", path: "/books" },
  lecture: { label: "محاضرة", table: "lectures", path: "/lectures" },
};

export default async function CommentsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page);

  let query = supabase.from("comments").select("*", { count: "exact" });
  if (params.q) query = query.or(orIlikeFilter(["author_name", "author_email", "body"], params.q));
  if (params.status === "pending") query = query.eq("is_approved", false);
  if (params.status === "approved") query = query.eq("is_approved", true);
  if (params.status === "unread") query = query.eq("is_read", false);
  if (params.type && params.type in TYPES) query = query.eq("content_type", params.type as CommentContentType);

  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error("Failed to load comments");
  const rows = data ?? [];

  // Titles of the commented items, fetched per content type in one query each.
  const titles = new Map<string, { title: string; slug: string; published: boolean }>();
  await Promise.all(
    (Object.keys(TYPES) as CommentContentType[]).map(async (type) => {
      const ids = [...new Set(rows.filter((r) => r.content_type === type).map((r) => r.content_id))];
      if (ids.length === 0) return;
      const { table } = TYPES[type];
      const select = table === "articles" ? "id, title, slug, status" : "id, title, slug, published";
      const { data: items } = await supabase.from(table).select(select).in("id", ids);
      for (const item of (items ?? []) as unknown as { id: string; title: string; slug: string; status?: string; published?: boolean }[]) {
        titles.set(`${type}:${item.id}`, { title: item.title, slug: item.slug, published: item.published ?? item.status === "published" });
      }
    })
  );

  const comments: ModerationComment[] = rows.map((r) => {
    const target = titles.get(`${r.content_type}:${r.content_id}`);
    return {
      id: r.id,
      authorName: r.author_name,
      authorEmail: r.author_email,
      isAccount: Boolean(r.user_id),
      body: r.body,
      isAnonymous: r.is_anonymous,
      isApproved: r.is_approved,
      isRead: r.is_read,
      createdAt: r.created_at,
      typeLabel: TYPES[r.content_type].label,
      targetTitle: target?.title ?? "محتوى محذوف",
      targetHref: target?.published ? `${TYPES[r.content_type].path}/${target.slug}` : null,
    };
  });
  const filtered = Boolean(params.q || params.status || params.type);

  return (
    <>
      <AdminPageHeader title="التعليقات" description="التعليقات لا تظهر في الموقع إلا بعد اعتمادها." />

      <ListToolbar
        searchPlaceholder="ابحثي بالاسم أو البريد أو نص التعليق..."
        filters={[
          {
            name: "status",
            label: "الحالة",
            options: [
              { value: "", label: "كل التعليقات" },
              { value: "pending", label: "بانتظار المراجعة" },
              { value: "approved", label: "معتمدة" },
              { value: "unread", label: "غير مقروءة" },
            ],
          },
          {
            name: "type",
            label: "النوع",
            options: [{ value: "", label: "كل الأنواع" }, ...Object.entries(TYPES).map(([value, t]) => ({ value, label: t.label }))],
          },
        ]}
      />

      {comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title={filtered ? "لا توجد نتائج" : "لا توجد تعليقات بعد"}
          description={filtered ? "جرّبي فلاتر أخرى." : "ستظهر هنا تعليقات الزوار على المقالات والمشاريع والكتب والمحاضرات."}
        />
      ) : (
        <ul className="rounded-2xl bg-paper border border-navy/5 divide-y divide-navy/5 overflow-hidden">
          {comments.map((c) => (
            <CommentRow key={c.id} comment={c} />
          ))}
        </ul>
      )}

      <Pagination basePath="/admin/comments" params={params} page={page} total={count ?? 0} />
    </>
  );
}
