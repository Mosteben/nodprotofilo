import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { requireAdminContext } from "@/lib/auth";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ListToolbar } from "@/components/admin/ListToolbar";
import { Pagination, pageRange } from "@/components/admin/Pagination";
import { EmptyState } from "@/components/admin/EmptyState";
import { MediaGrid } from "@/components/admin/media/MediaGrid";
import { MediaUploadPanel } from "@/components/admin/media/MediaUploadPanel";
import { orIlikeFilter } from "@/lib/utils";

export const metadata: Metadata = { title: "مكتبة الوسائط" };

const PAGE_SIZE = 24;

export default async function MediaPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const params = await searchParams;
  const { supabase } = await requireAdminContext();
  const { page, from, to } = pageRange(params.page, PAGE_SIZE);

  let query = supabase.from("media").select("*", { count: "exact" });
  if (params.q) query = query.or(orIlikeFilter(["file_name", "alt_text"], params.q));
  const { data, count, error } = await query.order("created_at", { ascending: false }).range(from, to);
  if (error) throw new Error("Failed to load media");
  const media = data ?? [];

  return (
    <>
      <AdminPageHeader title="مكتبة الوسائط" description={`${count ?? 0} صورة — ارفعي الصور هنا ثم استخدميها في المقالات والمشاريع.`} />

      <div className="mb-8">
        <MediaUploadPanel />
      </div>

      <ListToolbar searchPlaceholder="ابحثي باسم الملف أو النص البديل..." />

      {media.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title={params.q ? "لا توجد نتائج" : "المكتبة فارغة"}
          description={params.q ? "جرّبي كلمة بحث أخرى." : "ارفعي أول صورة من المساحة أعلاه."}
        />
      ) : (
        <MediaGrid media={media} />
      )}

      <Pagination basePath="/admin/media" params={params} page={page} total={count ?? 0} pageSize={PAGE_SIZE} />
    </>
  );
}
