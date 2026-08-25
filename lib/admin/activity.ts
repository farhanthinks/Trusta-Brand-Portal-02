import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActivityEventType } from "@/lib/supabase/types";

/**
 * Records an activity_logs row. Always uses the service-role client — no
 * regular user has an insert policy on this table, by design (see the
 * migration). Failures are swallowed: logging must never break the action
 * it's attached to.
 */
export async function logActivity(
  userId: string,
  eventType: ActivityEventType,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.from("activity_logs").insert({
      user_id: userId,
      event_type: eventType,
      metadata,
    });
  } catch {
    // Best-effort — never throw from a logging call site.
  }
}
