import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import type { CommentContentType } from "@/types/database";

export type PublicComment = { id: string; displayName: string | null; body: string; createdAt: string };

const fetchComments = unstable_cache(
  async (type: CommentContentType, id: string): Promise<PublicComment[]> => {
    const supabase = createPublicClient();
    if (!supabase) return [];
    // RPC returns approved comments only, without e-mails; anonymous ones have no name.
    const { data, error } = await supabase.rpc("get_approved_comments", { p_type: type, p_id: id });
    if (error) throw new Error(`comments: ${error.message}`);
    return (data ?? []).map((c) => ({ id: c.id, displayName: c.display_name, body: c.body, createdAt: c.created_at }));
  },
  ["approved-comments"],
  { tags: [CACHE_TAGS.comments], revalidate: PUBLIC_REVALIDATE_SECONDS }
);

/** Approved comments for one item; [] if the database is unreachable. */
export async function getApprovedComments(type: CommentContentType, id: string): Promise<PublicComment[]> {
  try {
    return await fetchComments(type, id);
  } catch (error) {
    console.error("[data] failed to load comments", error);
    return [];
  }
}
