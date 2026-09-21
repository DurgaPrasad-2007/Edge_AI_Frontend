"use client";

/**
 * OverviewPanel — Fleet Mission Control Dashboard
 * KPI grid, per-AMR status cards, active alerts, recent event feed
 */

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket, type RobotState, type FleetEvent } from "@/lib/use-fleet-socket";
import { MapPanel } from "@/components/console/map-panel";

// ── Robot color map ───────────────────────────────────────────────────────

const AMR_COLORS: Record<string, string> = {
  "AMR-01": "#C2541A",
  "AMR-02": "#F59E0B",
  "AMR-03": "#38BDF8",
};

const STATUS_COLORS: Record<string, string> = {
  Moving: "#10B981",
  "Task handoff": "#06B6D4",
  Rerouting: "#F59E0B",
  Yielding: "#A855F7",
  Charging: "#64748B",
  Blocked: "#EF4444",
};

const EVENT_COLORS: Record<string, string> = {
  LEASE: "#06B6D4",
  INTENT: "#A855F7",
  REROUTE: "#F59E0B",
  HANDOFF: "#10B981",
  HEARTBEAT: "#64748B",
};

// ── Battery donut ─────────────────────────────────────────────────────────

function BatteryDonut({ pct, color }: { pct: number; color: string }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dashArr = `${(pct / 100) * circ} ${circ}`;
  const batColor = pct < 25 ? "#EF4444" : pct < 50 ? "#F59E0B" : "#10B981";

  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx="28" cy="28" r={r} fill="none" stroke={batColor} strokeWidth="5"
        strokeDasharray={dashArr} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text x="28" y="33" textAnchor="middle" fill={batColor} fontSize="11" fontFamily="var(--font-mono)" fontWeight="700">
        {Math.round(pct)}%
      </text>
    </svg>
  );
}

// ── Robot card ────────────────────────────────────────────────────────────

function RobotCard({ robot }: { robot: RobotState }) {
  const color = AMR_COLORS[robot.id] ?? "#06B6D4";
  const statusColor = STATUS_COLORS[robot.status] ?? "#64748B";
  const isActive = ["Moving", "Task handoff", "Rerouting"].includes(robot.status);

  return (
    <div className="ov-robot-card" style={{ "--robot-accent": color } as React.CSSProperties}>
      <div className="ov-robot-header">
        <div className="ov-robot-id-badge" style={{ background: `${color}20`, borderColor: `${color}40` }}>
          <span style={{ color }}>{robot.id}</span>
          <span className="ov-robot-name">{robot.name}</span>
        </div>
        <div className="ov-robot-status-dot" style={{ background: statusColor, boxShadow: `0 0 8px ${statusColor}` }}>
          <span style={{ color: statusColor }}>{robot.status}</span>
        </div>
      </div>

      <div className="ov-robot-body">
        <BatteryDonut pct={robot.battery} color={color} />
        <div className="ov-robot-stats">
          <div className="ov-stat">
            <span className="ov-stat-label">PRIORITY</span>
            <div className="ov-priority-bar">
              <div style={{ width: `${robot.priority}%`, background: color, transition: "width 0.6s ease" }} />
            </div>
            <span className="ov-stat-val" style={{ fontFamily: "var(--font-mono)" }}>{robot.priority}</span>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-label">COMPLETED</span>
            <span className="ov-stat-val">{robot.completed}</span>
          </div>
          <div className="ov-stat">
            <span className="ov-stat-label">TASK</span>
            <span className="ov-stat-task">{robot.task}</span>
          </div>
        </div>
      </div>

      {isActive && (
        <div className="ov-progress-track">
          <div className="ov-progress-fill" style={{ width: `${robot.progress * 100}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

// ── KPI Big Card ──────────────────────────────────────────────────────────

function BigKPI({ label, value, sub, color, icon }: { label: string; value: string; sub?: string; color: string; icon: string }) {
  return (
    <div className="ov-kpi-card" style={{ "--kpi-color": color } as React.CSSProperties}>
      <div className="ov-kpi-icon">{icon}</div>
      <div className="ov-kpi-content">
        <span className="ov-kpi-label">{label}</span>
        <span className="ov-kpi-value" style={{ color }}>{value}</span>
        {sub && <span className="ov-kpi-sub">{sub}</span>}
      </div>
    </div>
  );
}

// ── Event feed item ───────────────────────────────────────────────────────

function EventItem({ ev }: { ev: FleetEvent }) {
  const color = EVENT_COLORS[ev.type] ?? "#64748B";
  return (
    <div className="ov-event-item">
      <span className="ov-event-time">{ev.time}</span>
      <span className="ov-event-type" style={{ color, borderColor: `${color}40` }}>{ev.type}</span>
      <span className="ov-event-msg">{ev.message}</span>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────

export function OverviewPanel() {
  const { session } = useAuth();
  const { fleetState, robots, events, kpis, tasks, connectionMode } = useFleetSocket(session?.access_token);
  const [viewMode, setViewMode] = useState<"hub" | "map" | "kpi">("hub");

  const activeRobots = robots.filter((r) => ["Moving", "Task handoff", "Rerouting"].includes(r.status));
  const pendingTasks = tasks.filter((t) => t.status === "Queued" || t.status === "Assigned").length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;

  return (
    <div className="console-panel ov-panel">
      {/* ── Header ── */}
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Mission Control</h1>
          <span className="panel-subtitle">Central Operations Hub · SIH-26123 · BEL Edge-AI AMR Coordination</span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`filter-tab${viewMode === "hub" ? " filter-tab-active" : ""}`}
              onClick={() => setViewMode("hub")}
            >
              ⊞ Control Hub
            </button>
            <button
              className={`filter-tab${viewMode === "map" ? " filter-tab-active" : ""}`}
              onClick={() => setViewMode("map")}
            >
              🗺 Full Map
            </button>
            <button
              className={`filter-tab${viewMode === "kpi" ? " filter-tab-active" : ""}`}
              onClick={() => setViewMode("kpi")}
            >
              📊 KPI Grid
            </button>
          </div>
          <span className={`badge badge-${connectionMode === "live" ? "live" : "sim"}`}>
            {connectionMode === "live" ? "● LIVE" : "◎ SIMULATION"}
          </span>
          {fleetState?.running && <span className="badge badge-running">▶ RUNNING</span>}
          {fleetState?.aisle_blocked && <span className="badge badge-warn">⚠ B-07 BLOCKED</span>}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="ov-kpi-grid">
        <BigKPI label="FLEET UTILIZATION" value={`${kpis.fleetUtilizationPct}%`}
          sub={`${activeRobots.length} of ${robots.length} AMRs active`} color="#06B6D4" icon="⚡" />
        <BigKPI label="AVG BATTERY" value={`${kpis.avgBatteryPct}%`}
          sub="across fleet" color={kpis.avgBatteryPct < 30 ? "#EF4444" : "#10B981"} icon="🔋" />
        <BigKPI label="TASKS/HR" value={`${kpis.tasksPerHour}`}
          sub="throughput estimate" color="#A855F7" icon="📦" />
        <BigKPI label="COMPLETED" value={`${kpis.completedTotal}`}
          sub={`+${completedTasks} this session`} color="#10B981" icon="✓" />
        <BigKPI label="PENDING TASKS" value={`${pendingTasks}`}
          sub="in queue" color="#F59E0B" icon="⏳" />
        <BigKPI label="COLLISIONS" value={`${kpis.collisionCount}`}
          sub="ISO 3691-4 safe" color={kpis.collisionCount > 0 ? "#EF4444" : "#10B981"} icon="🛡" />
        <BigKPI label="C-14 LEASES" value={`${kpis.activeLeases}`}
          sub={fleetState?.reservation ? `held by ${fleetState.reservation}` : "corridor free"} color="#F59E0B" icon="🔒" />
        <BigKPI label="MESH HEALTH" value={`${kpis.meshHealthPct}%`}
          sub="P2P peer links" color={kpis.meshHealthPct > 80 ? "#10B981" : "#F59E0B"} icon="📡" />
      </div>

      {/* ── Embedded Map Section ── */}
      {viewMode === "map" ? (
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-subtle)", marginBottom: "20px" }}>
          <MapPanel />
        </div>
      ) : viewMode === "hub" ? (
        <div style={{ marginBottom: "20px" }}>
          <div className="ov-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Live Digital Twin · Corridor C-14 Mutex & AMR Positions</span>
            <button className="filter-tab" onClick={() => setViewMode("map")} style={{ fontSize: "10px", padding: "2px 8px" }}>
              Expand Full Map ↗
            </button>
          </div>
          <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-subtle)" }}>
            <MapPanel />
          </div>
        </div>
      ) : null}

      {/* ── AMR Status Cards ── */}
      <div className="ov-section-title">Active AMR Units</div>
      <div className="ov-robots-grid">
        {robots.length === 0
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="ov-robot-card ov-robot-skeleton">
                <div className="skeleton-row" /><div className="skeleton-row short" />
              </div>
            ))
          : robots.map((r) => <RobotCard key={r.id} robot={r} />)}
      </div>

      {/* ── Event Feed ── */}
      <div className="ov-section-title">P2P Event Feed</div>
      <div className="ov-event-feed">
        {events.length === 0
          ? <div className="ov-empty">Awaiting fleet events…</div>
          : events.slice(0, 12).map((ev, i) => <EventItem key={i} ev={ev} />)}
      </div>
    </div>
  );
}
