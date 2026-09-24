import { cache } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database, ProfileRow } from "@/types/database";

export type AdminContext = {
  supabase: SupabaseClient<Database>;
  user: User;
  profile: ProfileRow;
};

export type AdminStatus =
  | { status: "unconfigured" }
  | { status: "signed-out" }
  | { status: "forbidden"; email: string }
  | ({ status: "ok" } & AdminContext);

/**
 * Resolves whether the current request comes from a signed-in admin.
 * Cached per request, so layouts, pages and actions can all call it cheaply.
 */
export const getAdminStatus = cache(async (): Promise<AdminStatus> => {
  const supabase = await createClient();
  if (!supabase) return { status: "unconfigured" };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) return { status: "forbidden", email: user.email ?? "" };

  return { status: "ok", supabase, user, profile };
});

/**
 * For admin pages rendered inside the dashboard layout (which already handles every
 * non-admin state). Throws if reached without an admin session.
 */
export async function requireAdminContext(): Promise<AdminContext> {
  const status = await getAdminStatus();
  if (status.status !== "ok") throw new Error("Admin session required");
  return status;
}
