import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { isUuid } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "تعديل مقالة" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase } = await requireAdminContext();
  const [{ data: article, error }, categories] = await Promise.all([
    supabase.from("articles").select("*").eq("id", id).maybeSingle(),
    distinctCategories(supabase, "articles"),
  ]);
  if (error) throw new Error("Failed to load article");
  if (!article) notFound();

  return (
    <>
      <AdminPageHeader title="تعديل مقالة" description={article.title} />
      {/* key: reset form state when navigating between articles */}
      <ArticleForm key={article.id} article={article} categories={categories} />
    </>
  );
}
