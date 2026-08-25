import "server-only";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";

const SESSION_COOKIE = "trusta_session_id";
/** A session with no heartbeat in this window is treated as no longer "live". */
export const ACTIVE_WINDOW_SECONDS = 5 * 60;

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

/** Closes out the current browser's session row and clears its cookie. */
export async function endSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return;

    const admin = createAdminClient();
    const { data: session } = await admin
      .from("user_sessions")
      .select("login_at")
      .eq("id", sessionId)
      .maybeSingle();

    const now = new Date();
    const durationSeconds = session
      ? Math.max(0, Math.round((now.getTime() - new Date(session.login_at).getTime()) / 1000))
      : null;

    await admin
      .from("user_sessions")
      .update({
        logout_at: now.toISOString(),
        is_active: false,
        duration_seconds: durationSeconds,
      })
      .eq("id", sessionId);

    cookieStore.delete(SESSION_COOKIE);
  } catch {
    // Best-effort.
  }
}

/** Bumps last_seen_at on the current browser's active session row. */
export async function touchSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return;

    const admin = createAdminClient();
    await admin
      .from("user_sessions")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", sessionId)
      .eq("is_active", true);
  } catch {
    // Best-effort.
  }
}
