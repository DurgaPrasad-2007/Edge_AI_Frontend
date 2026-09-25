"use client";

/**
 * CommsPanel — P2P Message Log
 * Full event stream from backend WebSocket with type filtering
 */

import { useState, useRef, useEffect, ReactNode } from "react";
import { useFleetSocket, type FleetEvent } from "@/lib/use-fleet-socket";
import { Lock, Radio, CornerDownRight, CheckCircle2, Activity } from "lucide-react";

const EVENT_META: Record<string, { color: string; icon: ReactNode; desc: string }> = {
  LEASE: { color: "#06B6D4", icon: <Lock className="w-3.5 h-3.5" />, desc: "Corridor space-time micro-lease grant/release" },
  INTENT: { color: "#A855F7", icon: <Radio className="w-3.5 h-3.5" />, desc: "Robot trajectory intent broadcast" },
  REROUTE: { color: "#F59E0B", icon: <CornerDownRight className="w-3.5 h-3.5" />, desc: "Dynamic reroute triggered by blockage/conflict" },
  HANDOFF: { color: "#10B981", icon: <CheckCircle2 className="w-3.5 h-3.5" />, desc: "Contract-Net task handoff / bid winner" },
  HEARTBEAT: { color: "#64748B", icon: <Activity className="w-3.5 h-3.5" />, desc: "Simulation state changes and task lifecycle" },
};

const ALL_TYPES = ["LEASE", "INTENT", "REROUTE", "HANDOFF", "HEARTBEAT"] as const;
type EventType = (typeof ALL_TYPES)[number];

function EventRow({ ev, index }: { ev: FleetEvent; index: number }) {
  const meta = EVENT_META[ev.type] ?? { color: "#64748B", icon: <Activity className="w-3.5 h-3.5" />, desc: "" };
  return (
    <div className={`comms-event-row${index % 2 === 0 ? " comms-event-alt" : ""}`}
      style={{ animationDelay: `${index * 20}ms` }}>
      <span className="comms-event-icon" style={{ color: meta.color, display: "inline-flex", alignItems: "center" }}>
        {meta.icon}
      </span>
      <span className="comms-event-time">{ev.time}</span>
      <span className="comms-event-type" style={{ color: meta.color, borderColor: `${meta.color}40` }}>
        {ev.type}
      </span>
      <span className="comms-event-msg">{ev.message}</span>
    </div>
  );
}

export function CommsPanel() {
  const { events, fleetState, robots, p2pMessages } = useFleetSocket();
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
          <span className="panel-subtitle">Fleet events and inter-robot packets · real-time</span>
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
            Tick {fleetState?.tick ?? 0} · {fleetState?.messages ?? 0} total peer packets
          </span>
        </div>
        <div className="comms-log-body">
          {filtered.length === 0 ? (
            <div className="comms-empty">
              {search ? "No messages match your search." : "No events yet — run the simulation or dispatch a task."}
            </div>
          ) : (
            filtered.map((ev, i) => <EventRow key={ev.id ?? i} ev={ev} index={i} />)
          )}
          <div ref={logEndRef} />
        </div>
      </div>

      {/* Mesh health indicator */}
      <div className="comms-mesh-bar">
        {robots.map((r) => (
          <div key={r.id} className="mesh-bar-item">
            <span
              className={`mesh-dot ${r.status === "Blocked" || r.battery <= 10 ? "mesh-dot-amber" : "mesh-dot-green"}`}
              title={r.status}
            />
            <span>{r.id} {r.name} · {r.status}</span>
          </div>
        ))}
        <div className="mesh-bar-divider" />
        <span className="mesh-protocol">{p2pMessages.length} recent packets · {robots.length} AMRs registered</span>
      </div>
    </div>
  );
}
