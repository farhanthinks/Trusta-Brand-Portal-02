import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { getActiveSessionId, endSession } from "@/lib/admin/sessions";

/**
 * Server-side logout bookkeeping only (activity log + session close-out).
 * Called from the client right before it clears its own local session — see
 * components/logout-button.tsx for why that call is awaited despite this
 * route never blocking the user on anything else.
 *
 * Reads the session id once, up front, and passes it to both endSession()
 * and logActivity() explicitly — reading it twice (each function pulling
 * its own cookies()) would race endSession()'s cookie deletion. Only logs
 * the `logout` event when endSession() reports it actually closed the
 * session, so a duplicate call (e.g. a retried request) can't double-log.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const sessionId = await getActiveSessionId();
    const closed = await endSession(sessionId);
    if (closed) await logActivity(user.id, "logout", {}, sessionId);
  }

  return NextResponse.json({ ok: true });
}
