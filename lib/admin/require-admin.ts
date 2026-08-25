import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Shared guard for admin server actions/route handlers. Reads the caller's
 * session via the cookie-bound (RLS-respecting) client, so `isAdmin` reflects
 * the `profiles.is_admin` flag under `is_admin()`'s own policies.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  return { supabase, user, isAdmin: Boolean(profile?.is_admin) };
}
