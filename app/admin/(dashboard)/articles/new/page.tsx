import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "مقالة جديدة" };

export default async function NewArticlePage() {
  const { supabase } = await requireAdminContext();
  const categories = await distinctCategories(supabase, "articles");

  return (
    <>
      <AdminPageHeader title="مقالة جديدة" />
      <ArticleForm categories={categories} />
    </>
  );
}
