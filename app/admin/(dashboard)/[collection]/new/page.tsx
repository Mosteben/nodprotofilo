import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { COLLECTIONS, isCollectionKey } from "@/lib/collections";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollectionForm } from "@/components/admin/collections/CollectionForm";

type Props = { params: Promise<{ collection: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? COLLECTIONS[collection].newLabel : "غير موجود" };
}

export default async function NewCollectionItemPage({ params }: Props) {
  const { collection } = await params;
  if (!isCollectionKey(collection)) notFound();
  const { supabase } = await requireAdminContext();
  const categories = await distinctCategories(supabase, COLLECTIONS[collection].table);

  return (
    <>
      <AdminPageHeader title={COLLECTIONS[collection].newLabel} description={COLLECTIONS[collection].title} />
      <CollectionForm collection={collection} item={null} suggestions={{ category: categories }} />
    </>
  );
}
