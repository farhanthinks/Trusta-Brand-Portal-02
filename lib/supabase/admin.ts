import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Service-role Supabase client. Bypasses Row Level Security.
 *
 * NEVER import this from client components or expose SUPABASE_SERVICE_ROLE_KEY
 * to the browser. Use only in Route Handlers / Server Actions that need to
 * write privileged fields (payment_status, entitlements) on behalf of the
 * system, e.g. the Razorpay webhook.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
