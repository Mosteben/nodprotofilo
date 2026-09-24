import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import type { BookRow, GalleryItemRow, LectureRow, ResourceRow } from "@/types/database";

type Table = "gallery_items" | "resources" | "books" | "lectures";
type RowOf = { gallery_items: GalleryItemRow; resources: ResourceRow; books: BookRow; lectures: LectureRow };

/** Published rows of a table in manual order, cached under the table's tag. */
function publishedRows<T extends Table>(table: T, tag: string) {
  const fetchRows = unstable_cache(
    async (): Promise<RowOf[T][]> => {
      const supabase = createPublicClient();
      if (!supabase) return [];
      // Generic table name: query untyped; the return type is RowOf[T].
      const { data, error } = await (supabase as unknown as SupabaseClient)
        .from(table)
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw new Error(`${table}: ${error.message}`);
      return data as RowOf[T][];
    },
    [`published-${table}`],
    { tags: [tag], revalidate: PUBLIC_REVALIDATE_SECONDS }
  );

  // Returns [] when the database is unreachable (the failure is not cached).
  return async (): Promise<RowOf[T][]> => {
    try {
      return await fetchRows();
    } catch (error) {
      console.error(`[data] failed to load ${table}`, error);
      return [];
    }
  };
}

export const getPublishedGallery = publishedRows("gallery_items", CACHE_TAGS.gallery);
export const getPublishedResources = publishedRows("resources", CACHE_TAGS.resources);
export const getPublishedBooks = publishedRows("books", CACHE_TAGS.books);
export const getPublishedLectures = publishedRows("lectures", CACHE_TAGS.lectures);

/** Featured first, then the manual order. */
export function featuredFirst<T extends { featured: boolean }>(rows: T[]): T[] {
  return [...rows.filter((r) => r.featured), ...rows.filter((r) => !r.featured)];
}

export async function getBookBySlug(slug: string): Promise<BookRow | null> {
  return (await getPublishedBooks()).find((b) => b.slug === slug) ?? null;
}

export async function getLectureBySlug(slug: string): Promise<LectureRow | null> {
  return (await getPublishedLectures()).find((l) => l.slug === slug) ?? null;
}
