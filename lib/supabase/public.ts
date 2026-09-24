import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { getSupabaseEnv } from "./config";

/**
 * Cookie-less anon client for public, cacheable reads. Row Level Security limits it to
 * published content. Returns null when Supabase is not configured.
 */
export function createPublicClient() {
  const env = getSupabaseEnv();
  if (!env) return null;

  return createClient<Database>(env.url, env.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
