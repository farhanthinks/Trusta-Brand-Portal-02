import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserSession } from "@/lib/supabase/types";

const SESSION_COOKIE = "trusta_session_id";
/**
 * A session with no heartbeat in this window is treated as no longer "live"
 * for display, and is what expire_stale_sessions() (see the logout/session
 * migration) uses as its default close-out timeout. Kept in sync with the
 * heartbeat cadence in components/session-heartbeat.tsx (30-60s pings) so a
 * couple of missed beats don't falsely expire an open tab.
 */
export const ACTIVE_WINDOW_SECONDS = 3 * 60;

/**
 * Opens a new user_sessions row for this login and remembers its id in an
 * httpOnly cookie, so the matching logout/heartbeat call can target the
 * exact row (a user may be logged in from more than one device/tab at once).
 * Must be called from a Server Action or Route Handler (cookie mutation).
 */
export async function startSession(userId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("user_sessions")
      .insert({ user_id: userId })
      .select("id")
      .single();

    if (error || !data) return;

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, data.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch {
    // Best-effort — session tracking must never block login.
  }
}

/**
 * Reads the current browser's session id from its httpOnly cookie — never
 * trust an id the client passes explicitly, this is the only source of
 * truth for "which session is this request".
 */
export async function getActiveSessionId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

/**
 * Closes out one session row (explicit logout). Guards on `is_active = true`
 * so a duplicate call (double-click, a second tab racing the same cookie)
 * is a safe no-op — returns whether THIS call was the one that closed it, so
 * callers only write one `logout` activity row per session, not one per
 * call.
 */
export async function endSession(sessionId: string | null): Promise<boolean> {
  let closed = false;
  try {
    if (sessionId) {
      const admin = createAdminClient();
      const { data: session } = await admin
        .from("user_sessions")
        .select("login_at")
        .eq("id", sessionId)
        .eq("is_active", true)
        .maybeSingle();

      if (session) {
        const now = new Date();
        const durationSeconds = Math.max(
          0,
          Math.round((now.getTime() - new Date(session.login_at).getTime()) / 1000)
        );

        const { data: updated } = await admin
          .from("user_sessions")
          .update({
            logout_at: now.toISOString(),
            is_active: false,
            duration_seconds: durationSeconds,
          })
          .eq("id", sessionId)
          .eq("is_active", true)
          .select("id")
          .maybeSingle();

        closed = Boolean(updated);
      }
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE);
  } catch {
    // Best-effort.
  }
  return closed;
}

/**
 * Bumps last_seen_at on the current browser's active session row, then
 * opportunistically sweeps any OTHER session (any user) whose heartbeat has
 * gone quiet past ACTIVE_WINDOW_SECONDS. There's no cron/worker in this
 * stack, so the steady trickle of heartbeat pings from every logged-in tab
 * (every 30-60s) is what stands in for one — cheap (one indexed UPDATE) and
 * safe to run this often since it only ever touches rows that are already
 * stale.
 */
export async function touchSession(): Promise<void> {
  try {
    const sessionId = await getActiveSessionId();
    if (sessionId) {
      const admin = createAdminClient();
      await admin
        .from("user_sessions")
        .update({ last_seen_at: new Date().toISOString() })
        .eq("id", sessionId)
        .eq("is_active", true);
    }
  } catch {
    // Best-effort.
  }

  await sweepExpiredSessions();
}

/**
 * Closes out every user_sessions row whose heartbeat has timed out and
 * records one `session_expired` activity_logs row per closed session — the
 * automatic counterpart to endSession()'s explicit logout. Runs via the
 * expire_stale_sessions() Postgres function (service-role only, see the
 * migration) so the "is it still active" check and the close-out write
 * happen atomically in one statement instead of a JS read-then-write race.
 */
export async function sweepExpiredSessions(): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.rpc("expire_stale_sessions", {
      p_timeout_seconds: ACTIVE_WINDOW_SECONDS,
    });
    const expired: UserSession[] = data ?? [];

    if (expired.length === 0) return;

    const userIds = Array.from(new Set(expired.map((s) => s.user_id)));
    const { data: brands } = await admin
      .from("brands")
      .select("id, user_id")
      .in("user_id", userIds);

    const brandIdByUser = new Map(brands?.map((b) => [b.user_id, b.id]) ?? []);

    await admin.from("activity_logs").insert(
      expired.map((s) => ({
        user_id: s.user_id,
        brand_id: brandIdByUser.get(s.user_id) ?? null,
        session_id: s.id,
        event_type: "session_expired" as const,
        metadata: {},
        created_at: s.logout_at ?? new Date().toISOString(),
      }))
    );
  } catch {
    // Best-effort — the sweep runs again on the next heartbeat regardless.
  }
}
