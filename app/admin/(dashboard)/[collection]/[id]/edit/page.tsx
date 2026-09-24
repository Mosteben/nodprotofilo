import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdminContext } from "@/lib/auth";
import { distinctCategories } from "@/lib/admin-data";
import { COLLECTIONS, isCollectionKey } from "@/lib/collections";
import { isUuid } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CollectionForm } from "@/components/admin/collections/CollectionForm";

type Props = { params: Promise<{ collection: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { collection } = await params;
  return { title: isCollectionKey(collection) ? `تعديل ${COLLECTIONS[collection].itemLabel}` : "غير موجود" };
}

export default async function EditCollectionItemPage({ params }: Props) {
  const { collection, id } = await params;
  if (!isCollectionKey(collection) || !isUuid(id)) notFound();
  const def = COLLECTIONS[collection];
  const { supabase } = await requireAdminContext();

  const [{ data: item, error }, categories] = await Promise.all([
    (supabase as unknown as SupabaseClient).from(def.table).select("*").eq("id", id).maybeSingle(),
    distinctCategories(supabase, def.table),
  ]);
  if (error) throw new Error(`Failed to load ${def.table}`);
  if (!item) notFound();
  const row = item as Record<string, unknown>;

  return (
    <>
      <AdminPageHeader title={`تعديل ${def.itemLabel}`} description={String(row[def.nameField] ?? def.title)} />
      <CollectionForm key={id} collection={collection} item={row} suggestions={{ category: categories }} />
    </>
  );
}
