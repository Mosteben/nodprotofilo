import type { Metadata } from "next";
import { Inbox } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { isUuid, orIlikeFilter } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { MessagesInbox } from "@/components/admin/MessagesInbox";

export const metadata: Metadata = { title: "الرسائل" };

type SearchParams = { q?: string; filter?: string; page?: string; open?: string };

export default async function MessagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page);

  let query = supabase.from("messages").select("*", { count: "exact" });
  if (params.q) query = query.or(orIlikeFilter(["name", "email", "subject"], params.q));
  if (params.filter === "unread") query = query.eq("is_read", false);
  if (params.filter === "read") query = query.eq("is_read", true);

  const [{ data, count, error }, openResult] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    params.open && isUuid(params.open)
      ? supabase.from("messages").select("*").eq("id", params.open).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (error) throw new Error("Failed to load messages");
  const messages = data ?? [];
  const filtered = Boolean(params.q || params.filter);

  return (
    <>
      <AdminPageHeader title="الرسائل" description="رسائل نموذج التواصل في الموقع." />

      <ListToolbar
        searchPlaceholder="ابحثي بالاسم أو البريد أو الموضوع..."
        filters={[
          {
            name: "filter",
            label: "الحالة",
            options: [
              { value: "", label: "كل الرسائل" },
              { value: "unread", label: "غير مقروءة" },
              { value: "read", label: "مقروءة" },
            ],
          },
        ]}
      />

      {messages.length === 0 && (
        <EmptyState
          icon={Inbox}
          title={filtered ? "لا توجد نتائج" : "لا توجد رسائل بعد"}
          description={filtered ? "جرّبي كلمات بحث أو فلاتر أخرى." : "ستظهر هنا الرسائل المرسلة من صفحة التواصل."}
        />
      )}
      {(messages.length > 0 || openResult.data) && (
        <MessagesInbox messages={messages} initialOpen={openResult.data ?? null} />
      )}

      <Pagination basePath="/admin/messages" params={params} page={page} total={count ?? 0} />
    </>
  );
}
