import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActivityEventType } from "@/lib/supabase/types";

interface RequestContext {
  ip: string | null;
  userAgent: string | null;
}

async function getRequestContext(): Promise<RequestContext> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    const ip = (forwardedFor ? forwardedFor.split(",")[0]?.trim() : null) || headerList.get("x-real-ip");
    return { ip, userAgent: headerList.get("user-agent") };
  } catch {
    return { ip: null, userAgent: null };
  }
}

/**
 * Records an activity_logs row. Always uses the service-role client — no
 * regular user has an insert policy on this table, by design (see the
 * migration). Failures are swallowed: logging must never break the action
 * it's attached to.
 *
 * Resolves brand_id at write time (a real FK, not a client-side join on
 * read) and captures the request's IP/user-agent from headers when
 * available — never fabricated when absent (e.g. local dev with no proxy
 * headers). user_agent rides in metadata (only shown in the event detail
 * view, not the compact list) rather than its own column.
 */
export async function logActivity(
  userId: string,
  eventType: ActivityEventType,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const admin = createAdminClient();

    const [{ data: brand }, { ip, userAgent }] = await Promise.all([
      admin.from("brands").select("id").eq("user_id", userId).maybeSingle(),
      getRequestContext(),
    ]);

    await admin.from("activity_logs").insert({
      user_id: userId,
      brand_id: brand?.id ?? null,
      event_type: eventType,
      metadata: userAgent ? { ...metadata, user_agent: userAgent } : metadata,
      ip_address: ip,
    });
  } catch {
    // Best-effort — never throw from a logging call site.
  }
}
