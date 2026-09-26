"use client";

import { useEffect } from "react";
import { useFleetSocket } from "@/lib/use-fleet-socket";

/** Shows the truth about the backend link: offline, or the reason a command was rejected. */
export function FleetStatusBanner() {
  const { isConnected, error, clearError, fleetState } = useFleetSocket();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 8000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (isConnected && !error) return null;
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
