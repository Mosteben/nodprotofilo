import type { Metadata } from "next";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "مشروع جديد" };

export default async function NewProjectPage() {
  const { supabase } = await requireAdminContext();
  const categories = await distinctCategories(supabase, "projects");

  return (
    <>
      <AdminPageHeader title="مشروع جديد" />
      <ProjectForm categories={categories} />
    </>
  );
}
