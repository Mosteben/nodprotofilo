import Link from "next/link";
import type { Route } from "next";
import { FileText, CheckCircle2, PencilLine, Briefcase, Mail, MessageSquare, Plus, ArrowLeft } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const { supabase, profile } = await requireAdminContext();

  const count = (query: PromiseLike<{ count: number | null }>) => query.then((r) => r.count ?? 0);
  const articles = () => supabase.from("articles").select("id", { count: "exact", head: true });

  const [total, published, drafts, projects, unread, pendingComments, recentArticles, recentMessages] = await Promise.all([
    count(articles()),
    count(articles().eq("status", "published")),
    count(articles().eq("status", "draft")),
    count(supabase.from("projects").select("id", { count: "exact", head: true })),
    count(supabase.from("messages").select("id", { count: "exact", head: true }).eq("is_read", false)),
    count(supabase.from("comments").select("id", { count: "exact", head: true }).eq("is_approved", false)),
    supabase
      .from("articles")
      .select("id, title, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5)
      .then((r) => r.data ?? []),
    supabase
      .from("messages")
      .select("id, name, subject, is_read, created_at")
      .order("created_at", { ascending: false })
      .limit(5)
      .then((r) => r.data ?? []),
  ]);

  const stats = [
    { label: "إجمالي المقالات", value: total, icon: FileText, href: "/admin/articles" },
    { label: "مقالات منشورة", value: published, icon: CheckCircle2, href: "/admin/articles?status=published" },
    { label: "مسودات", value: drafts, icon: PencilLine, href: "/admin/articles?status=draft" },
    { label: "المشاريع", value: projects, icon: Briefcase, href: "/admin/projects" },
    { label: "رسائل غير مقروءة", value: unread, icon: Mail, href: "/admin/messages?filter=unread" },
    { label: "تعليقات بانتظار المراجعة", value: pendingComments, icon: MessageSquare, href: "/admin/comments?status=pending" },
  ] as const;

  return (
    <>
      <AdminPageHeader
        title={`أهلًا${profile.name ? `، ${profile.name}` : ""}`}
        description="نظرة سريعة على محتوى موقعك."
        actions={
          <>
            <Button href="/admin/articles/new" size="sm">
              <Plus className="h-4 w-4" />
              مقالة جديدة
            </Button>
            <Button href="/admin/projects/new" size="sm" variant="outline">
              <Plus className="h-4 w-4" />
              مشروع جديد
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href as Route}
            className="rounded-2xl bg-paper p-5 border border-navy/5 hover:border-gold/40 hover:shadow-soft transition-all"
          >
            <Icon className="h-6 w-6 text-gold-dark mb-3" />
            <p className="font-display text-3xl text-navy">{value}</p>
            <p className="font-ui text-sm text-navy/60">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <section className="rounded-2xl bg-paper p-6 border border-navy/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-navy">آخر المقالات</h2>
            <Link href={"/admin/articles" as Route} className="font-ui text-sm text-gold-dark flex items-center gap-1 hover:underline">
              الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          {recentArticles.length === 0 ? (
            <p className="font-ui text-sm text-navy/50 py-6 text-center">لا توجد مقالات بعد.</p>
          ) : (
            <ul className="divide-y divide-navy/5">
              {recentArticles.map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/admin/articles/${a.id}/edit` as Route}
                    className="flex items-center justify-between gap-3 py-3 hover:text-gold-dark"
                  >
                    <span className="font-ui text-sm text-navy truncate">{a.title}</span>
                    <span className="flex items-center gap-3 shrink-0">
                      <span className="font-ui text-xs text-navy/40 hidden sm:inline">
                        {formatDate(a.updated_at, "short")}
                      </span>
                      <StatusBadge status={a.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-paper p-6 border border-navy/5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-navy">آخر الرسائل</h2>
            <Link href={"/admin/messages" as Route} className="font-ui text-sm text-gold-dark flex items-center gap-1 hover:underline">
              الكل <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          {recentMessages.length === 0 ? (
            <p className="font-ui text-sm text-navy/50 py-6 text-center">لا توجد رسائل بعد.</p>
          ) : (
            <ul className="divide-y divide-navy/5">
              {recentMessages.map((m) => (
                <li key={m.id}>
                  <Link
                    href={`/admin/messages?open=${m.id}` as Route}
                    className="flex items-center justify-between gap-3 py-3 hover:text-gold-dark"
                  >
                    <span className="min-w-0">
                      <span className={`block font-ui text-sm truncate ${m.is_read ? "text-navy/70" : "text-navy font-semibold"}`}>
                        {m.subject}
                      </span>
                      <span className="block font-ui text-xs text-navy/40 truncate">{m.name}</span>
                    </span>
                    <span className="flex items-center gap-3 shrink-0">
                      <span className="font-ui text-xs text-navy/40 hidden sm:inline">
                        {formatDate(m.created_at, "short")}
                      </span>
                      {!m.is_read && <StatusBadge status="unread" />}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
