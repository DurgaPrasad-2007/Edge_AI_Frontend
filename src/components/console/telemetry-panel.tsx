"use client";

/**
 * TelemetryPanel — Real-time Charts (pure SVG, zero extra deps)
 * - Battery trend lines per AMR (60-tick rolling window)
 * - Fleet throughput bar chart
 * - Corridor C-14 lease timeline
 * - P2P message rate sparkline
 */

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket, type RobotState } from "@/lib/use-fleet-socket";
import { CommsPanel } from "@/components/console/comms-panel";

const AMR_COLORS: Record<string, string> = {
  "AMR-01": "#C2541A",
  "AMR-02": "#F59E0B",
  "AMR-03": "#38BDF8",
};

// ── SVG Sparkline ─────────────────────────────────────────────────────────

function Sparkline({
  data, color, width = 300, height = 60, label, unit, showGrid = true,
}: {
  data: number[]; color: string; width?: number; height?: number;
  label?: string; unit?: string; showGrid?: boolean;
}) {
  if (data.length < 2) {
    return <div className="chart-empty">Awaiting data…</div>;
  }
  const min = Math.min(...data, 0);
  const max = Math.max(...data, 1);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8);
    return `${x},${y}`;
  });
  const areaPath = `M ${pts.join(" L ")} L ${width},${height} L 0,${height} Z`;
  const linePath = `M ${pts.join(" L ")}`;
  const latest = data[data.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height + 20}`} className="chart-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {showGrid && [0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" y1={height * (1 - f)} x2={width} y2={height * (1 - f)}
          stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={`url(#grad-${color.replace("#", "")})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Latest value dot */}
      <circle cx={width} cy={height - ((latest - min) / range) * (height - 8)} r="3.5" fill={color} />
      {/* Labels */}
      {label && <text x="4" y="12" fill="rgba(148,163,184,0.5)" fontSize="8" fontFamily="var(--font-mono)">{label}</text>}
      {unit && (
        <text x={width - 4} y="12" textAnchor="end" fill={color} fontSize="9" fontFamily="var(--font-mono)" fontWeight="600">
          {Math.round(latest * 10) / 10}{unit}
        </text>
      )}
      {/* Y-axis labels */}
      <text x="2" y={height - 2} fill="rgba(148,163,184,0.35)" fontSize="7" fontFamily="var(--font-mono)">{Math.round(min)}</text>
      <text x="2" y="22" fill="rgba(148,163,184,0.35)" fontSize="7" fontFamily="var(--font-mono)">{Math.round(max)}</text>
    </svg>
  );
}

// ── Battery trend chart ───────────────────────────────────────────────────

function BatteryTrendChart({ history }: { history: Record<string, number[]> }) {
  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Battery Trend (60-tick)</span>
        <div className="tele-legend">
          {Object.entries(AMR_COLORS).map(([id, color]) => (
            <span key={id} className="tele-legend-item">
              <span style={{ background: color, width: 8, height: 8, borderRadius: 2, display: "inline-block", marginRight: 4 }} />
              {id}
            </span>
          ))}
        </div>
      </div>
      <div className="tele-multi-chart">
        {Object.entries(AMR_COLORS).map(([id, color]) => (
          <div key={id} className="tele-sub-chart">
            <span className="tele-sub-label" style={{ color }}>{id}</span>
            <Sparkline data={history[id] ?? [100]} color={color} width={280} height={50} unit="%" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Message rate sparkline ────────────────────────────────────────────────

function MessageRateChart({ msgHistory }: { msgHistory: number[] }) {
  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">P2P Message Rate</span>
        <span className="tele-chart-sub">Zenoh DDS mesh packets/tick</span>
      </div>
      <Sparkline data={msgHistory} color="#A855F7" width={600} height={80} label="MSG RATE" unit=" msgs" />
    </div>
  );
}

// ── Lease timeline ────────────────────────────────────────────────────────

function LeaseTimeline({ leaseHistory }: { leaseHistory: Array<{ tick: number; holder: string | null }> }) {
  const recent = leaseHistory.slice(-60);
  const w = 600;
  const h = 40;
  const blockW = w / Math.max(1, recent.length);

  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Corridor C-14 Lease Timeline</span>
        <span className="tele-chart-sub">Space-time micro-lease occupancy (last 60 ticks)</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h + 24}`} className="chart-svg" style={{ width: "100%", height: "auto" }}>
        {/* Base track */}
        <rect x="0" y="8" width={w} height={h} fill="rgba(6,182,212,0.05)" rx="4" />
        {/* Lease segments */}
        {recent.map((entry, i) => {
          if (!entry.holder) return null;
          const color = AMR_COLORS[entry.holder] ?? "#06B6D4";
          return (
            <rect key={i} x={i * blockW} y="8" width={blockW} height={h}
              fill={color} fillOpacity="0.7" />
          );
        })}
        {/* Legend */}
        {Object.entries(AMR_COLORS).map(([id, color], i) => (
          <g key={id} transform={`translate(${i * 100}, ${h + 16})`}>
            <rect width="10" height="10" fill={color} rx="2" />
            <text x="14" y="9" fill="rgba(148,163,184,0.6)" fontSize="8" fontFamily="var(--font-mono)">{id}</text>
          </g>
        ))}
        <g transform={`translate(310, ${h + 16})`}>
          <rect width="10" height="10" fill="rgba(6,182,212,0.05)" stroke="rgba(6,182,212,0.3)" strokeWidth="1" rx="2" />
          <text x="14" y="9" fill="rgba(148,163,184,0.6)" fontSize="8" fontFamily="var(--font-mono)">Free</text>
        </g>
      </svg>
    </div>
  );
}

// ── Throughput bar chart ──────────────────────────────────────────────────

function ThroughputChart({ completedByRobot }: { completedByRobot: Record<string, number> }) {
  const maxVal = Math.max(1, ...Object.values(completedByRobot));

  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <span className="tele-chart-title">Task Completion by AMR</span>
        <span className="tele-chart-sub">Total tasks completed this session</span>
      </div>
      <div className="tele-bar-chart">
        {Object.entries(completedByRobot).map(([id, count]) => {
          const color = AMR_COLORS[id] ?? "#06B6D4";
          const pct = (count / maxVal) * 100;
          return (
            <div key={id} className="tele-bar-row">
              <span className="tele-bar-label" style={{ color }}>{id}</span>
              <div className="tele-bar-track">
                <div className="tele-bar-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="tele-bar-val">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main TelemetryPanel ───────────────────────────────────────────────────

export function TelemetryPanel() {
  const { session } = useAuth();
  const { robots, fleetState } = useFleetSocket(session?.access_token);

  const batteryHistory = useRef<Record<string, number[]>>({
    "AMR-01": [], "AMR-02": [], "AMR-03": [],
  });
  const msgHistory = useRef<number[]>([]);
  const leaseHistory = useRef<Array<{ tick: number; holder: string | null }>>([]);
  const prevMessages = useRef(0);

  const [, forceRender] = useState(0);

  useEffect(() => {
    if (!fleetState) return;

    // Record battery per robot
    for (const r of fleetState.robots) {
      const hist = batteryHistory.current[r.id] ?? [];
      hist.push(r.battery);
      if (hist.length > 60) hist.shift();
      batteryHistory.current[r.id] = hist;
    }

    // Record message delta
    const delta = fleetState.messages - prevMessages.current;
    prevMessages.current = fleetState.messages;
    msgHistory.current.push(Math.max(0, delta));
    if (msgHistory.current.length > 60) msgHistory.current.shift();

    // Lease history
    leaseHistory.current.push({ tick: fleetState.tick, holder: fleetState.reservation });
    if (leaseHistory.current.length > 120) leaseHistory.current.shift();

    forceRender((n) => n + 1);
  }, [fleetState]);

  // Completed by robot (from events — best effort)
  const completedByRobot = Object.fromEntries(
    robots.map((r) => [r.id, r.completed])
  );

  const [activeTab, setActiveTab] = useState<"charts" | "comms">("charts");

  return (
    <div className="console-panel tele-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Network & Comms</h1>
          <span className="panel-subtitle">Real-time telemetry streams · Zenoh DDS peer mesh monitor</span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`filter-tab${activeTab === "charts" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("charts")}
            >
              📊 Metrics & Charts
            </button>
            <button
              className={`filter-tab${activeTab === "comms" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("comms")}
            >
              📡 Zenoh Mesh Log
            </button>
          </div>
          <span className="badge badge-mono">TICK {fleetState?.tick ?? 0}</span>
          <span className="badge badge-mono">MSG {fleetState?.messages ?? 0}</span>
        </div>
      </div>

      {activeTab === "comms" ? (
        <CommsPanel />
      ) : (
        <>
          <div className="tele-charts-grid">
            <BatteryTrendChart history={batteryHistory.current} />
            <ThroughputChart completedByRobot={completedByRobot} />
            <MessageRateChart msgHistory={msgHistory.current.length ? msgHistory.current : [0]} />
            <LeaseTimeline leaseHistory={leaseHistory.current.length ? leaseHistory.current : [{ tick: 0, holder: null }]} />
          </div>

          {/* Metrics summary table */}
          <div className="tele-summary-table">
            <div className="tele-table-header">Live Robot Telemetry</div>
            <table className="tele-table">
              <thead>
                <tr>
                  <th>AMR ID</th><th>Name</th><th>Status</th><th>Battery</th>
                  <th>Priority</th><th>Path Progress</th><th>Position</th><th>Completed</th>
                </tr>
              </thead>
              <tbody>
                {robots.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: AMR_COLORS[r.id], fontFamily: "var(--font-mono)" }}>{r.id}</td>
                    <td>{r.name}</td>
                    <td><span className={`status-chip status-${r.status.toLowerCase().replace(" ", "-")}`}>{r.status}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", color: r.battery < 30 ? "#EF4444" : "#10B981" }}>
                      {Math.round(r.battery)}%
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>{r.priority}</td>
                    <td style={{ fontFamily: "var(--font-mono)" }}>
                      {r.path_index}/{r.path.length} ({Math.round(r.progress * 100)}%)
                    </td>
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {Math.round(r.position.x)}, {Math.round(r.position.y)}
                    </td>
                    <td style={{ color: "#10B981" }}>{r.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
