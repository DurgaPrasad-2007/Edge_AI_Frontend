import type { FleetEvent } from "@/lib/fleet-contract";
import { Radio } from "lucide-react";

const eventBadgeClass: Record<FleetEvent["type"], string> = {
  LEASE: "badge-active",
  INTENT: "badge-warning",
  REROUTE: "badge-danger",
  HANDOFF: "badge-nominal",
  HEARTBEAT: "badge-neutral",
};

export function EventStream({ events }: { events: FleetEvent[] }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-surface)",
        border: "1px solid var(--border-tactical)",
        borderRadius: 8,
        padding: "16px 20px",
        boxShadow: "var(--shadow-subtle)",
        marginTop: 16,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Radio className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
          <strong style={{ fontSize: 13, color: "var(--text-primary)" }}>
            Fleet Event Stream
          </strong>
        </div>
        <span className="badge badge-active" style={{ fontSize: 10 }}>
          LIVE FROM COORDINATOR
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 180, overflowY: "auto" }}>
        {events.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 12 }}>No events yet.</div>}
        {events.slice(0, 6).map((evt, idx) => (
          <div
            key={evt.id ?? `${evt.time}-${idx}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              padding: "6px 10px",
              borderRadius: 4,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <span className="mono-metric" style={{ fontSize: 11, color: "var(--text-muted)", minWidth: 55 }}>
              {evt.time}
            </span>
            <span className={`badge ${eventBadgeClass[evt.type]}`} style={{ fontSize: 9.5, padding: "1px 5px" }}>
              {evt.type}
            </span>
            <span style={{ color: "var(--text-secondary)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {evt.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
