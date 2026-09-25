"use client";

/**
 * OverviewPanel — Fleet Mission Control Dashboard
 * KPI grid, per-AMR status cards, active alerts, recent event feed
 */

import { useState } from "react";
import {
  Activity,
  BatteryCharging,
  Package,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Radio,
  LayoutDashboard,
  Map,
  BarChart3,
  AlertTriangle,
  Play,
} from "lucide-react";
import { useFleetSocket, type RobotState, type FleetEvent } from "@/lib/use-fleet-socket";
import { MapPanel } from "@/components/console/map-panel";

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
  const color = robot.color;
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

// ── KPI Card (Clean Industrial High-Density Layout) ──────────────────────────

interface BigKPIProps {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  icon: React.ReactNode;
  iconColor?: string;
  valueColor?: string;
}

function BigKPI({ label, value, unit, sub, icon, iconColor, valueColor }: BigKPIProps) {
  return (
    <div className="ov-kpi-card">
      <div className="ov-kpi-top">
        <span className="ov-kpi-label">{label}</span>
        <div
          className="ov-kpi-icon-badge"
          style={{
            color: iconColor ?? "var(--text-secondary)",
            background: iconColor ? `${iconColor}15` : "var(--bg-elevated)",
            borderColor: iconColor ? `${iconColor}35` : "var(--border-subtle)",
          }}
        >
          {icon}
        </div>
      </div>
      <div className="ov-kpi-value-row">
        <span className="ov-kpi-value" style={valueColor ? { color: valueColor } : undefined}>
          {value}
        </span>
        {unit && <span className="ov-kpi-unit">{unit}</span>}
      </div>
      {sub && <span className="ov-kpi-sub">{sub}</span>}
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
  const { fleetState, robots, events, kpis, connectionMode, world } = useFleetSocket();
  const zoneId = world?.mutex_zones[0] ?? "Mutex zone";
  const zoneHolder = fleetState?.leases[zoneId] ?? null;
  const blockedLabels = (fleetState?.blocked_nodes ?? []).map((id) => world?.nodes.find((n) => n.id === id)?.label ?? id);
  const [viewMode, setViewMode] = useState<"hub" | "map" | "kpi">("hub");

  const activeRobots = robots.filter((r) => ["Moving", "Task handoff", "Rerouting"].includes(r.status));

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
              <LayoutDashboard className="w-3.5 h-3.5 inline mr-1.5" />
              Control Hub
            </button>
            <button
              className={`filter-tab${viewMode === "map" ? " filter-tab-active" : ""}`}
              onClick={() => setViewMode("map")}
            >
              <Map className="w-3.5 h-3.5 inline mr-1.5" />
              Full Map
            </button>
            <button
              className={`filter-tab${viewMode === "kpi" ? " filter-tab-active" : ""}`}
              onClick={() => setViewMode("kpi")}
            >
              <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
              KPI Grid
            </button>
          </div>
          <span className={`badge badge-${connectionMode === "live" ? "live" : "sim"}`}>
            {connectionMode === "live" ? "● LIVE" : "○ OFFLINE"}
          </span>
          {fleetState?.running && (
            <span className="badge badge-running inline-flex items-center gap-1">
              <Play className="w-2.5 h-2.5 fill-current" /> RUNNING
            </span>
          )}
          {fleetState?.aisle_blocked && (
            <span className="badge badge-warn inline-flex items-center gap-1">
              <AlertTriangle className="w-2.5 h-2.5" /> {blockedLabels.join(", ").toUpperCase()} BLOCKED
            </span>
          )}
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="ov-kpi-grid">
        <BigKPI
          label="Fleet Utilization"
          value={kpis.fleetUtilizationPct}
          unit="%"
          sub={`${robots.filter((r) => r.task_id).length} of ${robots.length} AMRs on a mission`}
          icon={<Activity />}
          iconColor="var(--solar-terracotta)"
        />
        <BigKPI
          label="Avg Battery"
          value={kpis.avgBatteryPct}
          unit="%"
          sub="across all AMRs"
          icon={<BatteryCharging />}
          iconColor={kpis.avgBatteryPct < 30 ? "#EF4444" : "#10B981"}
          valueColor={kpis.avgBatteryPct < 30 ? "#EF4444" : undefined}
        />
        <BigKPI
          label="Tasks / Hour"
          value={kpis.tasksPerHour}
          sub="since the floor was reset"
          icon={<Package />}
          iconColor="var(--solar-terracotta)"
        />
        <BigKPI
          label="Completed"
          value={kpis.completedTotal}
          sub="all-time, from the database"
          icon={<CheckCircle2 />}
          iconColor="#10B981"
        />
        <BigKPI
          label="Pending Queue"
          value={kpis.queuedTasks}
          sub="queued or blocked, awaiting a robot"
          icon={<Clock />}
          iconColor={kpis.queuedTasks > 0 ? "var(--solar-terracotta)" : "var(--text-tertiary)"}
        />
        <BigKPI
          label="Collisions"
          value={kpis.collisionCount}
          sub={kpis.collisionCount > 0 ? "proximity violations recorded" : "no proximity violations"}
          icon={kpis.collisionCount > 0 ? <ShieldAlert /> : <ShieldCheck />}
          iconColor={kpis.collisionCount > 0 ? "#EF4444" : "#10B981"}
          valueColor={kpis.collisionCount > 0 ? "#EF4444" : undefined}
        />
        <BigKPI
          label={`${zoneId} Mutex`}
          value={zoneHolder ?? "OPEN"}
          sub={zoneHolder ? "lease held" : "corridor free"}
          icon={<Lock />}
          iconColor={zoneHolder ? "var(--solar-terracotta)" : "#10B981"}
          valueColor={zoneHolder ? "var(--solar-terracotta)" : "#10B981"}
        />
        <BigKPI
          label="Fleet Health"
          value={kpis.meshHealthPct}
          unit="%"
          sub="AMRs operational (not blocked, battery > 10%)"
          icon={<Radio />}
          iconColor={kpis.meshHealthPct > 80 ? "#10B981" : "#F59E0B"}
        />
      </div>

      {/* ── Embedded Map Section ── */}
      {viewMode === "map" ? (
        <div style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border-subtle)", marginBottom: "20px" }}>
          <MapPanel />
        </div>
      ) : viewMode === "hub" ? (
        <div style={{ marginBottom: "20px" }}>
          <div className="ov-section-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>Live Digital Twin · {zoneId} Mutex & AMR Positions</span>
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
      <div className="ov-section-title">Fleet Event Feed</div>
      <div className="ov-event-feed">
        {events.length === 0
          ? <div className="ov-empty">Awaiting fleet events…</div>
          : events.slice(0, 12).map((ev, i) => <EventItem key={ev.id ?? i} ev={ev} />)}
      </div>
    </div>
  );
}
