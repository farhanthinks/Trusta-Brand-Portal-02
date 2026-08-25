"use client";

import { useEffect } from "react";

const HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000;

/** Pings the server every few minutes to keep user_sessions.last_seen_at fresh. */
export function SessionHeartbeat() {
  useEffect(() => {
    const ping = () => {
      fetch("/api/session/heartbeat", { method: "POST" }).catch(() => {});
    };

    ping();
    const interval = setInterval(ping, HEARTBEAT_INTERVAL_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
