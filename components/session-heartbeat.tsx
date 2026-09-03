"use client";

import { useEffect } from "react";

// Kept well under the server's ACTIVE_WINDOW_SECONDS (3 min) close-out
// timeout so a couple of missed/delayed beats don't falsely expire an open
// tab. This is the primary source of truth for "is this session still
// alive" — pagehide/visibilitychange below are best-effort only, they never
// end a session themselves.
const HEARTBEAT_INTERVAL_MS = 45 * 1000;

/** Pings the server every 30-60s to keep user_sessions.last_seen_at fresh. */
export function SessionHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/session/heartbeat", { method: "POST" }).catch(() => {});
    };

    // Best-effort final ping right as the tab is torn down, so the
    // eventual heartbeat-timeout close-out (see expire_stale_sessions())
    // computes an accurate logout_at/duration instead of one that's stale
    // by up to a full heartbeat interval. Deliberately NOT beforeunload/
    // unload — those are unreliable and shouldn't gate anything here since
    // this never ends the session on its own, only refreshes last_seen_at.
    const onPageHide = () => {
      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/session/heartbeat");
      } else {
        fetch("/api/session/heartbeat", { method: "POST", keepalive: true }).catch(() => {});
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ping();
      else onPageHide();
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, []);

  return null;
}
