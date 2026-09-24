export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Reads the public Supabase credentials. Returns null (instead of throwing) when they are
 * missing so the public site can still render friendly empty states.
 *
 * The variables must be referenced literally so Next.js can inline them in client bundles.
 */
export function getSupabaseEnv(): SupabaseEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv() !== null;
}

export const MEDIA_BUCKET = "media";
