import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/admin/activity";
import { endSession } from "@/lib/admin/sessions";

/**
 * Server-side logout bookkeeping only (activity log + session close-out).
 * Called fire-and-forget from the client right before it clears its own
 * local session — the user never waits on this round-trip.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await Promise.all([logActivity(user.id, "logout"), endSession()]);
  }

  return NextResponse.json({ ok: true });
}
