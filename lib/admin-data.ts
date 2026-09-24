import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/** Distinct, non-empty categories already used in a table (for form suggestions). */
export async function distinctCategories(
  supabase: SupabaseClient<Database>,
  table: "articles" | "projects"
): Promise<string[]> {
  const { data } = await supabase.from(table).select("category").not("category", "is", null);
  return Array.from(new Set((data ?? []).map((r) => r.category).filter((c): c is string => Boolean(c)))).sort();
}
