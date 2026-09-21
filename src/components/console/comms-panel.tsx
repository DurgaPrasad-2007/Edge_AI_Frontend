"use client";

/**
 * CommsPanel — P2P Message Log
 * Full event stream from backend WebSocket with type filtering
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket, type FleetEvent } from "@/lib/use-fleet-socket";

const EVENT_META: Record<string, { color: string; icon: string; desc: string }> = {
  LEASE: { color: "#06B6D4", icon: "🔒", desc: "Corridor space-time micro-lease grant/release" },
  INTENT: { color: "#A855F7", icon: "📡", desc: "Robot trajectory intent broadcast (peer mesh)" },
  REROUTE: { color: "#F59E0B", icon: "🔀", desc: "Dynamic reroute triggered by blockage/conflict" },
  HANDOFF: { color: "#10B981", icon: "🤝", desc: "Contract-Net task handoff / bid winner" },
  HEARTBEAT: { color: "#64748B", icon: "💓", desc: "Peer quorum heartbeat / mesh health check" },
};

const ALL_TYPES = ["LEASE", "INTENT", "REROUTE", "HANDOFF", "HEARTBEAT"] as const;
type EventType = (typeof ALL_TYPES)[number];

function EventRow({ ev, index }: { ev: FleetEvent; index: number }) {
  const meta = EVENT_META[ev.type] ?? { color: "#64748B", icon: "●", desc: "" };
  return (
    <div className={`comms-event-row${index % 2 === 0 ? " comms-event-alt" : ""}`}
      style={{ animationDelay: `${index * 20}ms` }}>
      <span className="comms-event-icon">{meta.icon}</span>
      <span className="comms-event-time">{ev.time}</span>
      <span className="comms-event-type" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
        {ev.type}
      </span>
      <span className="comms-event-msg">{ev.message}</span>
    </div>
  );
}

export function CommsPanel() {
  const { session } = useAuth();
  const { events, fleetState } = useFleetSocket(session?.access_token);
  const [filter, setFilter] = useState<EventType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef<HTMLDivElement>(null);

  const filtered = events
    .filter((e) => filter === "ALL" || e.type === filter)
    .filter((e) => !search || e.message.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [events, autoScroll]);

  const counts = Object.fromEntries(ALL_TYPES.map((t) => [t, events.filter((e) => e.type === t).length]));

  return (
    <div className="console-panel comms-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">P2P Comms Log</h1>
          <span className="panel-subtitle">Zenoh DDS Peer-to-Peer Message Stream · Real-time</span>
        </div>
        <div className="comms-controls">
          <input
            className="comms-search"
            placeholder="Search messages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className={`btn-toggle${autoScroll ? " btn-toggle-on" : ""}`}
            onClick={() => setAutoScroll((a) => !a)}
          >
            {autoScroll ? "⇣ Auto" : "⏸ Hold"}
          </button>
        </div>
      </div>

      {/* Protocol type chips */}
      <div className="comms-filter-bar">
        <button className={`comms-filter-chip${filter === "ALL" ? " active" : ""}`}
          onClick={() => setFilter("ALL")}>
          ALL <span className="chip-count">{events.length}</span>
        </button>
        {ALL_TYPES.map((t) => {
          const meta = EVENT_META[t];
          return (
            <button key={t}
              className={`comms-filter-chip${filter === t ? " active" : ""}`}
              style={filter === t ? { borderColor: meta.color, color: meta.color } : {}}
              onClick={() => setFilter(t)}>
              {meta.icon} {t} <span className="chip-count">{counts[t]}</span>
            </button>
          );
        })}
      </div>

      {/* Protocol legend */}
      <div className="comms-proto-legend">
        {ALL_TYPES.map((t) => {
          const meta = EVENT_META[t];
          return (
            <div key={t} className="proto-legend-item">
              <span style={{ color: meta.color }}>{meta.icon} {t}</span>
              <span className="proto-legend-desc">{meta.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Message log */}
      <div className="comms-log-container">
        <div className="comms-log-header">
          <span>EVENT LOG · {filtered.length} messages</span>
          <span className="comms-log-stats">
            Tick {fleetState?.tick ?? 0} · {fleetState?.messages ?? 0} total P2P msgs
          </span>
        </div>
        <div className="comms-log-body">
          {filtered.length === 0 ? (
            <div className="comms-empty">
              {search ? "No messages match your search." : "Start simulation to see P2P events…"}
            </div>
          ) : (
            filtered.map((ev, i) => <EventRow key={i} ev={ev} index={i} />)
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Mesh health indicator */}
      <div className="comms-mesh-bar">
        <div className="mesh-bar-item">
          <span className="mesh-dot mesh-dot-green" />
          <span>AMR-01 Atlas · Direct Link</span>
        </div>
        <div className="mesh-bar-item">
          <span className="mesh-dot mesh-dot-amber" />
          <span>AMR-02 Nova · Direct Link</span>
        </div>
        <div className="mesh-bar-item">
          <span className="mesh-dot mesh-dot-cyan" />
          <span>AMR-03 Kite · Direct Link</span>
        </div>
        <div className="mesh-bar-divider" />
        <span className="mesh-protocol">rmw_zenoh · No Central Broker · Peer Discovery Active</span>
      </div>
    </div>
  );
}
