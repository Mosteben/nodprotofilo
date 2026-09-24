import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type TableWithCategory = "articles" | "projects" | "gallery_items" | "resources" | "books" | "lectures";

/** Distinct, non-empty categories already used in a table (for form suggestions). */
export async function distinctCategories(supabase: SupabaseClient<Database>, table: TableWithCategory): Promise<string[]> {
  const { data } = await (supabase as unknown as SupabaseClient).from(table).select("category").not("category", "is", null);
  const values = ((data ?? []) as { category: string | null }[]).map((r) => r.category);
  return Array.from(new Set(values.filter((c): c is string => Boolean(c)))).sort();
}
