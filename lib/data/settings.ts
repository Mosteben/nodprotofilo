import { unstable_cache } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from "@/lib/cache-tags";
import { DEFAULT_SITE_CONTENT, toSiteContent, type SiteContent } from "@/lib/site-settings";

const cacheOptions = { tags: [CACHE_TAGS.settings], revalidate: PUBLIC_REVALIDATE_SECONDS };

const fetchSiteContent = unstable_cache(
  async (): Promise<SiteContent> => {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_SITE_CONTENT;
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
    if (error) throw new Error(`site_settings: ${error.message}`);
    return toSiteContent(data);
  },
  ["site-content"],
  cacheOptions
);

/** Effective site settings. Falls back to the built-in defaults if the database is unreachable. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    return await fetchSiteContent();
  } catch (error) {
    console.error("[data] failed to load site settings", error);
    return DEFAULT_SITE_CONTENT;
  }
}

export type PublicProfile = {
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  location: string | null;
  website: string | null;
};

const fetchPublicProfile = unstable_cache(
  async (): Promise<PublicProfile | null> => {
    const supabase = createPublicClient();
    if (!supabase) return null;
    const { data, error } = await supabase.rpc("get_public_profile");
    if (error) throw new Error(`profile: ${error.message}`);
    const row = data?.[0];
    return row
      ? { name: row.name, bio: row.bio, avatarUrl: row.avatar_url, location: row.location, website: row.website }
      : null;
  },
  ["public-profile"],
  cacheOptions
);

/** The site owner's public profile fields (no e-mail or phone). */
export async function getPublicProfile(): Promise<PublicProfile | null> {
  try {
    return await fetchPublicProfile();
  } catch (error) {
    console.error("[data] failed to load profile", error);
    return null;
  }
}
