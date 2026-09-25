"use client";

import { useEffect } from "react";
import { useFleetSocket } from "@/lib/use-fleet-socket";

/** Shows the truth about the backend link: offline, or the reason a command was rejected. */
export function FleetStatusBanner() {
  const { isConnected, error, clearError, fleetState, needsLogin } = useFleetSocket();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 8000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (isConnected && !error) return null;
  if (needsLogin && !error) {
    return (
      <div role="status" style={{ margin: "0 0 12px", padding: "8px 14px", borderRadius: 6, border: "1px solid var(--border-tactical)", background: "var(--bg-elevated)", color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>
        Sign in to view live fleet data. <a href="/login" style={{ color: "var(--solar-terracotta)", textDecoration: "underline" }}>Go to login</a>
      </div>
    );
  }
  const offline = !isConnected;
  const color = offline ? "#F59E0B" : "#EF4444";
  return (
    <div
      role={offline ? "status" : "alert"}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        margin: "0 0 12px",
        padding: "8px 14px",
        borderRadius: 6,
        border: `1px solid ${color}`,
        background: `${color}1A`,
        color,
        fontFamily: "var(--font-mono)",
        fontSize: 12,
        fontWeight: 700,
      }}
    >
      <span>
        {offline
          ? fleetState
            ? "BACKEND OFFLINE — showing last known fleet state; commands are disabled until it reconnects."
            : "BACKEND OFFLINE — waiting for the fleet coordinator."
          : error}
      </span>
      {error && (
        <button type="button" onClick={clearError} style={{ color, fontWeight: 800 }} aria-label="Dismiss message">
          ✕
        </button>
      )}
    </div>
  );
}
