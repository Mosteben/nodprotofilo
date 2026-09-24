import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Plus, LayoutGrid } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { COLLECTIONS, isCollectionKey } from "@/lib/collections";
import { orIlikeFilter } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { EmptyState } from "@/components/admin/EmptyState";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { CollectionRowActions } from "@/components/admin/collections/CollectionRowActions";
import { Button } from "@/components/ui/Button";

type Props = { params: Promise<{ collection: string }>; searchParams: Promise<{ q?: string; status?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? COLLECTIONS[collection].title : "غير موجود" };
}

export default async function CollectionListPage({ params, searchParams }: Props) {
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const def = COLLECTIONS[collection];
  const { q, status } = await searchParams;
  const { supabase } = await requireAdminContext();

  // Ordered by the manual sort order, as on the public page.
  let query = (supabase as unknown as SupabaseClient).from(def.table).select("*", { count: "exact" });
  if (q) query = query.or(orIlikeFilter(def.searchColumns, q));
  if (status === "published") query = query.eq("published", true);
  if (status === "draft") query = query.eq("published", false);
  if (status === "featured" && def.hasFeatured) query = query.eq("featured", true);
  const { data, count, error } = await query.order("sort_order", { ascending: true }).order("created_at", { ascending: false }).limit(500);
  if (error) throw new Error(`Failed to load ${def.table}`);

  const items = (data ?? []) as Record<string, unknown>[];
  const filtered = Boolean(q || status);
  const newHref = `/admin/${collection}/new` as Route;

  return (
    <>
      <AdminPageHeader
        title={def.title}
        description={`${count ?? 0} عنصر — ${def.description}`}
        actions={
          <Button href={newHref} size="sm">
            <Plus className="h-4 w-4" />
            {def.newLabel}
          </Button>
        }
      />

      <ListToolbar
        searchPlaceholder="بحث..."
        filters={[
          {
            name: "status",
            label: "الحالة",
            options: [
              { value: "", label: "الكل" },
              { value: "published", label: "منشور" },
              { value: "draft", label: "غير منشور" },
              ...(def.hasFeatured ? [{ value: "featured", label: "مميّز" }] : []),
            ],
          },
        ]}
      />

      {items.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title={filtered ? "لا توجد نتائج" : "لا يوجد محتوى بعد"}
          description={filtered ? "جرّبي كلمات بحث أو فلاتر أخرى." : `أضيفي أول ${def.itemLabel}.`}
          action={
            !filtered && (
              <Button href={newHref} size="sm">
                <Plus className="h-4 w-4" />
                {def.newLabel}
              </Button>
            )
          }
        />
      ) : (
        <ul className="rounded-2xl bg-paper border border-navy/5 divide-y divide-navy/5 overflow-hidden">
          {items.map((item, index) => {
            const id = String(item.id);
            const name = String(item[def.nameField] || item.alt_text || item.file_name || "بدون عنوان");
            const image = item[def.imageField] as string | null;
            const published = Boolean(item.published);
            const featured = Boolean(item.featured);
            return (
              <li key={id} className="flex flex-wrap sm:flex-nowrap items-center gap-4 px-4 py-3 hover:bg-section/40">
                <div className="h-14 w-14 shrink-0 rounded-xl overflow-hidden bg-section">
                  {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnails */}
                  {image && <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0 font-ui">
                  <Link href={`/admin/${collection}/${id}/edit` as Route} className="block font-semibold text-sm text-navy truncate hover:text-gold-dark">
                    {name}
                  </Link>
                  <span className="flex flex-wrap items-center gap-2 mt-1">
                    <StatusBadge status={published ? "published" : "draft"} />
                    {featured && <StatusBadge status="featured" />}
                    {typeof item.category === "string" && <span className="text-xs text-navy/50">{item.category}</span>}
                  </span>
                </div>
                <CollectionRowActions
                  collection={collection}
                  id={id}
                  name={name}
                  published={published}
                  featured={featured}
                  canFeature={def.hasFeatured}
                  publicHref={published ? def.publicPath(item) : null}
                  isFirst={index === 0}
                  isLast={index === items.length - 1}
                />
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
