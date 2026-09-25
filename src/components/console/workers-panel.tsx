"use client";

/**
 * WorkersPanel — AMR Fleet Management
 * Shows robot cards with battery donuts, speed, live status, quick actions
 * Wired to backend: POST /api/fleet/simulation, POST /api/fleet/reservations
 */

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket, type RobotState } from "@/lib/use-fleet-socket";
import { JobsPanel } from "@/components/console/jobs-panel";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { Bot, ClipboardList, Navigation, Play, Pause, RotateCcw } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  Moving: "#10B981",
  "Task handoff": "#06B6D4",
  Rerouting: "#F59E0B",
  Yielding: "#A855F7",
  Charging: "#64748B",
  Blocked: "#EF4444",
};

const LEG_LABEL: Record<string, string> = {
  idle: "Docked / standby",
  to_pickup: "Heading to pickup",
  to_drop: "Delivering payload",
  to_home: "Returning to dock",
  to_charge: "Heading to charge bay",
};

// ── Battery Donut (large version) ─────────────────────────────────────────

function BatteryDonut({ pct, color }: { pct: number; color: string }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = `${(pct / 100) * circ} ${circ}`;
  const batColor = pct < 25 ? "#EF4444" : pct < 50 ? "#F59E0B" : "#10B981";

  return (
    <svg width="88" height="88" viewBox="0 0 88 88" className="battery-donut-svg">
      {/* Track */}
      <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
      {/* Fill */}
      <circle cx="44" cy="44" r={r} fill="none" stroke={batColor} strokeWidth="7"
        strokeDasharray={dash} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: "stroke-dasharray 1s ease" }} />
      {/* Center text */}
      <text x="44" y="40" textAnchor="middle" fill={batColor} fontSize="16" fontFamily="var(--font-mono)" fontWeight="700">
        {Math.round(pct)}%
      </text>
      <text x="44" y="55" textAnchor="middle" fill="rgba(148,163,184,0.5)" fontSize="8" fontFamily="var(--font-mono)">
        BATTERY
      </text>
    </svg>
  );
}

// ── Speed gauge bar ───────────────────────────────────────────────────────

function SpeedGauge({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0;
  return (
    <div className="speed-gauge">
      <div className="speed-gauge-label">
        <span>SPEED</span>
        <span style={{ color, fontFamily: "var(--font-mono)" }}>{current.toFixed(0)} u/s</span>
      </div>
      <div className="speed-gauge-track">
        <div className="speed-gauge-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="speed-gauge-scale">
        <span>0</span>
        <span>MAX {max.toFixed(0)} map-units/s</span>
      </div>
    </div>
  );
}

// ── Progress ring for task completion ─────────────────────────────────────

function TaskProgressRing({ progress, color }: { progress: number; color: string }) {
  const r = 16;
  const circ = 2 * Math.PI * r;
  const dash = `${(progress / 100) * circ} ${circ}`;

  return (
    <svg width="40" height="40" viewBox="0 0 40 40">
      <circle cx="20" cy="20" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
      <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={dash} strokeDashoffset={circ / 4} strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.5s ease" }} />
      <text x="20" y="24" textAnchor="middle" fill={color} fontSize="8" fontFamily="var(--font-mono)" fontWeight="600">
        {progress}%
      </text>
    </svg>
  );
}

// ── AMR Worker Card ───────────────────────────────────────────────────────

function WorkerCard({ robot, heldZones, maxSpeed }: {
  robot: RobotState;
  heldZones: string[];
  /** map units per second, from the backend's robot spec */
  maxSpeed: number;
}) {
  const color = robot.color;
  const statusColor = STATUS_COLORS[robot.status] ?? "#64748B";
  const taskPct = Math.round(robot.progress * 100);
  const isActive = robot.status === "Moving" || robot.status === "Rerouting";
  const currentSpeed = isActive ? maxSpeed : 0;

  return (
    <div className="worker-card" style={{ "--amr-color": color } as React.CSSProperties}>
      {/* Header */}
      <div className="worker-card-header">
        <div className="worker-id-section">
          <div className="worker-id-badge" style={{ color, borderColor: `${color}40`, background: `${color}12` }}>
            {robot.id}
          </div>
          <div className="worker-name-role">
            <span className="worker-name">{robot.name}</span>
            <span className="worker-role">{robot.payload_capacity_kg ?? "?"} kg class</span>
          </div>
        </div>
        <div className="worker-status-section">
          <div className="worker-status-dot" style={{ background: statusColor }} />
          <span className="worker-status-text" style={{ color: statusColor }}>{robot.status}</span>
          {heldZones.map((zone) => (
            <span key={zone} className="worker-lease-badge">{zone} LEASE</span>
          ))}
        </div>
      </div>

      {/* Main metrics */}
      <div className="worker-metrics">
        <BatteryDonut pct={robot.battery} color={color} />

        <div className="worker-center-stats">
          <SpeedGauge current={currentSpeed} max={maxSpeed} color={color} />
          <div className="worker-stat-grid">
            <div className="worker-stat-item">
              <span className="wstat-label">PRIORITY</span>
              <span className="wstat-val" style={{ color }}>{robot.priority}</span>
            </div>
            <div className="worker-stat-item">
              <span className="wstat-label">COMPLETED</span>
              <span className="wstat-val">{robot.completed}</span>
            </div>
            <div className="worker-stat-item">
              <span className="wstat-label">PATH IDX</span>
              <span className="wstat-val font-mono">{robot.path_index}/{robot.path.length}</span>
            </div>
            <div className="worker-stat-item">
              <span className="wstat-label">POSITION</span>
              <span className="wstat-val font-mono" style={{ fontSize: "10px" }}>
                {Math.round(robot.position.x)},{Math.round(robot.position.y)}
              </span>
            </div>
          </div>
        </div>

        {/* Task progress */}
        <div className="worker-task-section">
          <TaskProgressRing progress={taskPct} color={color} />
          <div className="worker-task-info">
            <span className="worker-task-label">CURRENT TASK</span>
            <span className="worker-task-val">{robot.task}</span>
          </div>
        </div>
      </div>

      {/* Payload */}
      <div className="worker-hw-row">
        <span className="worker-hw-label">LOAD</span>
        <span className="worker-hw-val">
          {robot.current_payload_kg ?? 0} / {robot.payload_capacity_kg ?? "?"} kg
        </span>
        <span className="worker-hw-pill">{robot.completed} DELIVERED</span>
      </div>

      {/* Mission leg */}
      <div className="worker-safety-row">
        <Navigation className="w-3.5 h-3.5 text-[var(--accent-amber)] shrink-0" />
        <span className="worker-safety-mode">
          {LEG_LABEL[robot.leg ?? "idle"]}
          {robot.target ? ` → ${robot.target}` : ""}
        </span>
      </div>
    </div>
  );
}

// ── Main WorkersPanel ─────────────────────────────────────────────────────

export function WorkersPanel() {
  const { user } = useAuth();
  const { robots, fleetState, sendControl, connectionMode, world, isConnected } = useFleetSocket();
  const period = world?.config.control_period_s ?? 0.6;
  const zoneLabel = world?.mutex_zones[0] ?? "Mutex zone";
  const speedOf = (id: string) => (world?.robots.find((r) => r.id === id)?.speed ?? 0) / period;
  const [activeTab, setActiveTab] = useState<"units" | "tasks">("units");

  const canControl = user?.roles?.some((r) => r === "operator" || r === "admin") ?? false;

  // Fleet aggregate stats
  const totalBattery = robots.reduce((s, r) => s + r.battery, 0);
  const avgBattery = robots.length ? Math.round(totalBattery / robots.length) : 0;
  const activeCount = robots.filter((r) => r.task_id).length;

  return (
    <div className="console-panel workers-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Fleet & Tasks</h1>
          <span className="panel-subtitle">Autonomous Mobile Robot Management · Contract-Net Task Queue</span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`filter-tab${activeTab === "units" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("units")}
            >
              <Bot className="w-3.5 h-3.5 inline mr-1.5" />
              AMR Units ({robots.length})
            </button>
            <button
              className={`filter-tab${activeTab === "tasks" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("tasks")}
            >
              <ClipboardList className="w-3.5 h-3.5 inline mr-1.5" />
              Task Queue & Dispatch
            </button>
          </div>
        </div>
        {canControl && (
          <div className="panel-header-actions">
            <button className="btn-primary" disabled={!isConnected} onClick={() => sendControl("start")}>
              <Play className="w-3.5 h-3.5 inline mr-1.5" /> Run Fleet
            </button>
            <button className="btn-secondary" disabled={!isConnected} onClick={() => sendControl("pause")}>
              <Pause className="w-3.5 h-3.5 inline mr-1.5" /> Pause
            </button>
            <button className="btn-ghost" disabled={!isConnected} onClick={() => sendControl("reset")}>
              <RotateCcw className="w-3.5 h-3.5 inline mr-1.5" /> Reset
            </button>
          </div>
        )}
      </div>

      <FleetStatusBanner />

      {activeTab === "tasks" ? (
        <JobsPanel />
      ) : (
        <>
          {/* Fleet aggregate bar */}
          <div className="workers-fleet-bar">
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">ACTIVE AMRs</span>
              <span className="fleet-bar-val" style={{ color: "var(--neon-cyan)" }}>{activeCount}/{robots.length}</span>
            </div>
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">AVG BATTERY</span>
              <span className="fleet-bar-val" style={{ color: avgBattery < 30 ? "var(--status-danger)" : "var(--status-nominal)" }}>{avgBattery}%</span>
            </div>
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">COMPLETED TASKS</span>
              <span className="fleet-bar-val" style={{ color: "var(--status-nominal)" }}>{fleetState?.completed_tasks ?? 0}</span>
            </div>
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">{zoneLabel.toUpperCase()} LEASE</span>
              <span className="fleet-bar-val" style={{ color: fleetState?.reservation ? "var(--accent-amber)" : "var(--text-muted)" }}>
                {fleetState?.reservation ?? "None"}
              </span>
            </div>
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">P2P MESSAGES</span>
              <span className="fleet-bar-val">{fleetState?.messages ?? 0}</span>
            </div>
            <div className="fleet-bar-stat">
              <span className="fleet-bar-label">BACKEND</span>
              <span className="fleet-bar-val" style={{ color: connectionMode === "live" ? "var(--status-nominal)" : "var(--accent-amber)" }}>
                {connectionMode === "live" ? "LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Worker cards */}
          <div className="workers-grid">
            {robots.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><Bot className="w-8 h-8 opacity-60 text-current" /></div>
                <div className="empty-title">Fleet offline</div>
                <div className="empty-sub">No fleet data received. Start the EdgeAI_Backend server; this page reconnects automatically.</div>
              </div>
            ) : (
              robots.map((r) => (
                <WorkerCard
                  key={r.id}
                  robot={r}
                  heldZones={Object.entries(fleetState?.leases ?? {}).filter(([, holder]) => holder === r.id).map(([zone]) => zone)}
                  maxSpeed={speedOf(r.id)}
                />
              ))
            )}
          </div>

          {/* Protocol reference */}
          <div className="workers-protocol-box">
            <div className="proto-box-title">Fleet Coordination Protocol</div>
            <div className="proto-box-grid">
              <div className="proto-item"><span>Task Allocation</span><span>Contract-Net bidding (capacity, battery, A* distance, priority)</span></div>
              <div className="proto-item"><span>Collision Avoidance</span><span>Node reservations with look-ahead + {zoneLabel} lease</span></div>
              <div className="proto-item"><span>Rerouting</span><span>A* replanned on every blockage / deadlock</span></div>
              <div className="proto-item"><span>Control Tick</span><span>{Math.round(period * 1000)}ms</span></div>
              <div className="proto-item"><span>Persistence</span><span>Task lifecycle stored in the database</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
