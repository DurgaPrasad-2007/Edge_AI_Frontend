"use client";

/**
 * AnalyticsPanel — live metrics derived from the backend's state stream:
 * traffic heat (real robot positions), fleet activity breakdown and KPIs.
 */

import { useState } from "react";
import { useFleetSocket, type RobotState, type World } from "@/lib/use-fleet-socket";
import { AuditPanel } from "@/components/console/audit-panel";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { Flame, ShieldCheck } from "lucide-react";

// ── Traffic Heatmap (cumulative position density) ─────────────────────────

function TrafficHeatmap({ heat, world }: { heat: Record<string, number>; world: World | null }) {
  const maxHeat = Math.max(1, ...Object.values(heat));
  const hotspots = Object.entries(heat).map(([key, count]) => {
    const [x, y] = key.split(",").map(Number);
    return { x, y, intensity: count / maxHeat };
  });

  const pad = 60;
  const xs = world?.nodes.map((n) => n.x) ?? [0, 1000];
  const ys = world?.nodes.map((n) => n.y) ?? [0, 600];
  const minX = Math.min(...xs) - pad;
  const minY = Math.min(...ys) - pad;
  const width = Math.max(...xs) + pad - minX;
  const height = Math.max(...ys) + pad - minY;
  const nodeById = new Map(world?.nodes.map((n) => [n.id, n]) ?? []);

  return (
    <div className="analytics-heatmap-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Robot Traffic Heatmap</span>
        <span className="tele-chart-sub">Cumulative robot position density since the last reset · hot = visited most</span>
      </div>
      <div className="heatmap-container">
        <svg viewBox={`${minX} ${minY} ${width} ${height}`} className="heatmap-svg" preserveAspectRatio="xMidYMid meet">
          <rect x={minX + 10} y={minY + 10} width={width - 20} height={height - 20} fill="rgba(15,23,42,0.8)" stroke="rgba(6,182,212,0.15)" strokeWidth="1" rx="4" />

          {/* Lanes from the backend graph */}
          {world?.edges.map(([a, b]) => {
            const from = nodeById.get(a);
            const to = nodeById.get(b);
            return from && to ? <line key={`${a}|${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="rgba(148,163,184,0.25)" strokeWidth="1" strokeDasharray="3 5" /> : null;
          })}

          {hotspots.map(({ x, y, intensity }) => (
            <circle key={`${x},${y}`} cx={x} cy={y} r={24 * intensity + 6} fill={`rgba(239,68,68,${intensity * 0.65})`} style={{ mixBlendMode: "screen" }} />
          ))}

          {world?.mutex_zones.map((id) => {
            const n = nodeById.get(id);
            return n ? (
              <g key={id}>
                <rect x={n.x - 55} y={n.y - 24} width="110" height="48" fill="rgba(6,182,212,0.06)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" strokeDasharray="4,4" rx="4" />
                <text x={n.x} y={n.y + 3} textAnchor="middle" fill="rgba(6,182,212,0.6)" fontSize="8" fontFamily="var(--font-mono)">
                  {id} MUTEX ZONE
                </text>
              </g>
            ) : null;
          })}

          <defs>
            <linearGradient id="heatScale" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="rgba(59,130,246,0.6)" />
              <stop offset="50%" stopColor="rgba(251,191,36,0.7)" />
              <stop offset="100%" stopColor="rgba(239,68,68,0.8)" />
            </linearGradient>
          </defs>
          <rect x={minX + width - 170} y={minY + height - 30} width="140" height="10" fill="url(#heatScale)" rx="5" />
          <text x={minX + width - 170} y={minY + height - 8} fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="var(--font-mono)">LOW</text>
          <text x={minX + width - 30} y={minY + height - 8} textAnchor="end" fill="rgba(148,163,184,0.6)" fontSize="9" fontFamily="var(--font-mono)">HIGH</text>
        </svg>
      </div>
    </div>
  );
}

// ── Fleet activity breakdown ──────────────────────────────────────────────

const ACTIVITIES: Array<{ label: string; color: string; match: (r: RobotState) => boolean }> = [
  { label: "Waiting / blocked", color: "#EF4444", match: (r) => r.status === "Yielding" || r.status === "Blocked" },
  { label: "Charging", color: "#F59E0B", match: (r) => r.status === "Charging" },
  { label: "Delivering payload", color: "#10B981", match: (r) => r.leg === "to_drop" },
  { label: "Heading to pickup", color: "#06B6D4", match: (r) => r.leg === "to_pickup" },
  { label: "Returning to dock / charger", color: "#A855F7", match: (r) => r.leg === "to_home" || r.leg === "to_charge" },
  { label: "Docked / idle", color: "#64748B", match: () => true },
];

function ActivityChart({ robots }: { robots: RobotState[] }) {
  const counts = ACTIVITIES.map(() => 0);
  for (const r of robots) counts[ACTIVITIES.findIndex((a) => a.match(r))] += 1;
  const total = Math.max(1, robots.length);
  const onMission = robots.filter((r) => r.task_id).length;
  const r = 70;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Fleet Activity</span>
        <span className="tele-chart-sub">What each AMR is doing right now</span>
      </div>
      <div className="zone-util-layout">
        <svg viewBox="0 0 180 180" className="zone-donut-svg">
          {ACTIVITIES.map((a, i) => {
            const dash = (counts[i] / total) * circ;
            const seg = counts[i] > 0 ? (
              <circle key={a.label} cx="90" cy="90" r={r} fill="none" stroke={a.color} strokeWidth="22" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} strokeLinecap="butt" />
            ) : null;
            offset += dash;
            return seg;
          })}
          <text x="90" y="86" textAnchor="middle" fill="var(--text-primary)" fontSize="14" fontFamily="var(--font-mono)" fontWeight="700">
            {Math.round((onMission / total) * 100)}%
          </text>
          <text x="90" y="102" textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-mono)">ON MISSION</text>
        </svg>
        <div className="zone-util-legend">
          {ACTIVITIES.map((a, i) => (
            <div key={a.label} className="zone-legend-item">
              <span className="zone-legend-dot" style={{ background: a.color }} />
              <span className="zone-legend-label">{a.label}</span>
              <span className="zone-legend-pct" style={{ color: a.color }}>{counts[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Live KPI table ────────────────────────────────────────────────────────

function KPITable({ rows }: { rows: Array<{ label: string; value: string; note: string; bad?: boolean }> }) {
  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Live KPIs</span>
        <span className="tele-chart-sub">Computed by the coordinator, not by this page</span>
      </div>
      <table className="kpi-compare-table">
        <thead>
          <tr><th>Metric</th><th>Value</th><th>Definition</th></tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="td-mono" style={{ color: row.bad ? "#EF4444" : "#06B6D4" }}>{row.value}</td>
              <td className="td-delta" style={{ color: "var(--text-muted)", fontWeight: 400 }}>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────

export function AnalyticsPanel({ initialTab = "analytics" }: { initialTab?: "analytics" | "audit" }) {
  const { robots, fleetState, kpis, world, history } = useFleetSocket();
  const [activeTab, setActiveTab] = useState<"analytics" | "audit">(initialTab);

  const rows = [
    { label: "Tasks / hour", value: String(kpis.tasksPerHour), note: "completions this session ÷ simulated hours" },
    { label: "Completed (all-time)", value: String(kpis.completedTotal), note: "tasks marked Completed in the database" },
    { label: "Queued / blocked", value: String(kpis.queuedTasks), note: "waiting for a capable, reachable AMR" },
    { label: "Proximity violations", value: String(kpis.collisionCount), note: `robots closer than ${world?.config.collision_radius ?? "?"} map units`, bad: kpis.collisionCount > 0 },
    { label: "Fleet utilization", value: `${kpis.fleetUtilizationPct}%`, note: "AMRs currently holding a task" },
    { label: "Average battery", value: `${kpis.avgBatteryPct}%`, note: "mean state of charge" },
    { label: "Active corridor leases", value: String(kpis.activeLeases), note: "mutex zones currently leased" },
    { label: "Peer packets", value: String(fleetState?.messages ?? 0), note: "bids, leases, yields and heartbeats exchanged" },
  ];

  return (
    <div className="console-panel analytics-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Insights & Audit</h1>
          <span className="panel-subtitle">Live metrics · traffic density · persisted audit trail</span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button className={`filter-tab${activeTab === "analytics" ? " filter-tab-active" : ""}`} onClick={() => setActiveTab("analytics")}>
              <Flame className="w-3.5 h-3.5 inline mr-1.5" />
              Heatmaps & Metrics
            </button>
            <button className={`filter-tab${activeTab === "audit" ? " filter-tab-active" : ""}`} onClick={() => setActiveTab("audit")}>
              <ShieldCheck className="w-3.5 h-3.5 inline mr-1.5" />
              Audit Trail
            </button>
          </div>
        </div>
      </div>

      <FleetStatusBanner />

      {activeTab === "audit" ? (
        <AuditPanel />
      ) : (
        <div className="analytics-grid">
          <TrafficHeatmap heat={history.heat} world={world} />
          <div className="analytics-side">
            <ActivityChart robots={robots} />
            <KPITable rows={rows} />
          </div>
        </div>
      )}
    </div>
  );
}
