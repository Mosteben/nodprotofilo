import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { isUuid } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProjectForm } from "@/components/admin/ProjectForm";

export const metadata: Metadata = { title: "تعديل مشروع" };

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();

  const { supabase } = await requireAdminContext();
  const [{ data: project, error }, categories] = await Promise.all([
    supabase.from("projects").select("*").eq("id", id).maybeSingle(),
    distinctCategories(supabase, "projects"),
  ]);
  if (error) throw new Error("Failed to load project");
  if (!project) notFound();

  return (
    <>
      <AdminPageHeader title="تعديل مشروع" description={project.title} />
      <ProjectForm key={project.id} project={project} categories={categories} />
    </>
  );
}
