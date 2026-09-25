import type { Metadata } from "next";
import { Inbox, MailOpen } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { isUuid, orIlikeFilter } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { MessageList } from "@/components/admin/messages/MessageList";
import { MessageDetail } from "@/components/admin/messages/MessageDetail";
import { ReplyComposer } from "@/components/admin/messages/ReplyComposer";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "الرسائل" };

type SearchParams = { q?: string; filter?: string; page?: string; open?: string };

function hrefWith(params: SearchParams, changes: Partial<SearchParams>) {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...params, ...changes })) if (value) qs.set(key, value);
  const s = qs.toString();
  return `/admin/messages${s ? `?${s}` : ""}`;
}

export default async function MessagesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page);
  const openId = params.open && isUuid(params.open) ? params.open : null;

  let query = supabase.from("messages").select("*", { count: "exact" });
  if (params.q) query = query.or(orIlikeFilter(["name", "email", "subject", "message"], params.q));
  if (params.filter === "unread") query = query.eq("is_read", false);
  if (params.filter === "read") query = query.eq("is_read", true);

  const [{ data, count, error }, { data: selected }, { count: unread }] = await Promise.all([
    query.order("created_at", { ascending: false }).range(from, to),
    openId ? supabase.from("messages").select("*").eq("id", openId).maybeSingle() : Promise.resolve({ data: null }),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false),
  ]);
  if (error) throw new Error("Failed to load messages");

  const messages = data ?? [];
  const filtered = Boolean(params.q || params.filter);
  const closeHref = hrefWith(params, { open: undefined });

  return (
    <>
      <AdminPageHeader
        title="الرسائل"
        description={`${count ?? 0} رسالة${unread ? ` · ${unread} غير مقروءة` : ""} — رسائل صفحة التواصل.`}
      />

      <ListToolbar
        searchPlaceholder="ابحثي بالاسم أو البريد أو نص الرسالة..."
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

      <div className="grid lg:grid-cols-[minmax(280px,380px)_1fr] gap-4 items-start">
        {/* List pane — hidden on small screens while a message is open */}
        <section
          aria-label="قائمة الرسائل"
          className={cn("rounded-2xl bg-paper border border-navy/5 overflow-hidden", selected && "hidden lg:block")}
        >
          {messages.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <Inbox className="h-10 w-10 text-gold-dark/70 mx-auto mb-3" />
              <p className="font-display text-xl text-navy">{filtered ? "لا توجد نتائج" : "لا توجد رسائل بعد"}</p>
              <p className="font-ui text-sm text-navy/50 mt-1">
                {filtered ? "جرّبي كلمات بحث أو فلاتر أخرى." : "ستظهر هنا الرسائل المرسلة من صفحة التواصل."}
              </p>
            </div>
          ) : (
            <div className="lg:max-h-[calc(100vh-16rem)] lg:overflow-y-auto">
              <MessageList
                messages={messages}
                selectedId={selected?.id ?? null}
                hrefFor={(id) => hrefWith(params, { open: id })}
                now={new Date()}
              />
            </div>
          )}
          <div className="px-4 pb-4">
            <Pagination basePath="/admin/messages" params={{ ...params, open: undefined }} page={page} total={count ?? 0} />
          </div>
        </section>

        {/* Reading pane */}
        <section
          aria-label="الرسالة"
          className={cn(
            "rounded-2xl bg-paper border border-navy/5 min-h-[420px] lg:sticky lg:top-6",
            !selected && "hidden lg:flex lg:items-center lg:justify-center"
          )}
        >
          {selected ? (
            <MessageDetail key={selected.id} message={selected} closeHref={closeHref}>
              {selected.email && <ReplyComposer message={selected} />}
            </MessageDetail>
          ) : (
            <div className="text-center p-10">
              <MailOpen className="h-10 w-10 text-navy/20 mx-auto mb-3" />
              <p className="font-ui text-sm text-navy/50">اختاري رسالة من القائمة لقراءتها.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
