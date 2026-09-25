"use client";

/**
 * TelemetryPanel — Real-time Charts (pure SVG, zero extra deps)
 * - Battery trend lines per AMR (60-tick rolling window)
 * - Fleet throughput bar chart
 * - Corridor C-14 lease timeline
 * - P2P message rate sparkline
 */

import { useState } from "react";
import { useFleetSocket, type RobotState } from "@/lib/use-fleet-socket";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { CommsPanel } from "@/components/console/comms-panel";
import { Activity, Radio } from "lucide-react";

// ── SVG Sparkline ─────────────────────────────────────────────────────────

function Sparkline({
  data,
  color,
  width = 300,
  height = 70,
  label,
  unit,
  fixedMin = 0,
  fixedMax,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  label?: string;
  unit?: string;
  fixedMin?: number;
  fixedMax?: number;
}) {
  const safeData = data && data.length > 0 ? data : [0];
  const renderedData = safeData.length === 1 ? [safeData[0], safeData[0]] : safeData;

  const dataMin = Math.min(...renderedData);
  const dataMax = Math.max(...renderedData);

  const min = fixedMin !== undefined ? fixedMin : Math.min(dataMin, 0);
  const max = fixedMax !== undefined ? fixedMax : Math.max(dataMax, 1);
  const range = max - min || 1;

  const topPad = 14;
  const bottomPad = 14;
  const plotH = height - topPad - bottomPad;

  const pts = renderedData.map((v, i) => {
    const x = (i / (renderedData.length - 1)) * width;
    const y = topPad + plotH - ((v - min) / range) * plotH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const areaPath = `M 0,${height - bottomPad} L ${pts.join(" L ")} L ${width},${height - bottomPad} Z`;
  const linePath = `M ${pts.join(" L ")}`;
  const latest = renderedData[renderedData.length - 1];
  const lastX = width;
  const lastY = topPad + plotH - ((latest - min) / range) * plotH;

  const gradId = `grad-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div className="tele-sparkline-wrapper" style={{ width: "100%", position: "relative" }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="chart-svg"
        preserveAspectRatio="none"
        style={{ width: "100%", height: `${height}px`, display: "block" }}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Subtle grid lines */}
        <line x1="0" y1={topPad} x2={width} y2={topPad} stroke="var(--border-subtle)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="0" y1={topPad + plotH / 2} x2={width} y2={topPad + plotH / 2} stroke="var(--border-subtle)" strokeWidth="0.8" strokeDasharray="3 3" />
        <line x1="0" y1={height - bottomPad} x2={width} y2={height - bottomPad} stroke="var(--border-subtle)" strokeWidth="1" />

        {/* Shaded Area and Stroke Line */}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Pulse endpoint circle */}
        <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
        <circle cx={lastX} cy={lastY} r="6" fill="none" stroke={color} strokeWidth="1" opacity="0.4" />
      </svg>

      {/* HTML overlay labels so fonts never distort or stretch across aspect ratios */}
      <div
        style={{
          position: "absolute",
          top: 2,
          left: 4,
          right: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pointerEvents: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
        }}
      >
        <span style={{ color: "var(--text-muted)", fontSize: "9px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {label ?? ""}
        </span>
        <span style={{ color, fontWeight: 700 }}>
          {Math.round(latest * 10) / 10}{unit ?? ""}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 4,
          right: 4,
          display: "flex",
          justifyContent: "space-between",
          pointerEvents: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "8.5px",
          color: "var(--text-muted)",
        }}
      >
        <span>{Math.round(min)}</span>
        <span>{Math.round(max)}</span>
      </div>
    </div>
  );
}

// ── Battery trend chart ───────────────────────────────────────────────────

function BatteryTrendChart({ history, robots }: { history: Record<string, number[]>; robots: RobotState[] }) {
  const colors = Object.fromEntries(robots.map((r) => [r.id, r.color])) as Record<string, string>;
  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <div className="flex flex-col">
          <span className="tele-chart-title">Battery Level Dynamics</span>
          <span className="tele-chart-sub">Real-time state of charge (%) · 60-tick rolling window</span>
        </div>
        <div className="tele-legend">
          {Object.entries(colors).map(([id, color]) => (
            <span key={id} className="tele-legend-item">
              <span style={{ background: color, width: 8, height: 8, borderRadius: 2, display: "inline-block", marginRight: 4 }} />
              {id}
            </span>
          ))}
        </div>
      </div>
      <div className="tele-multi-chart">
        {Object.entries(colors).map(([id, color]) => (
          <div key={id} className="tele-sub-chart">
            <span className="tele-sub-label" style={{ color }}>{id}</span>
            <div className="flex-1">
              <Sparkline
                data={history[id] ?? [0]}
                color={color}
                width={380}
                height={64}
                unit="%"
                fixedMin={0}
                fixedMax={100}
              />
            </div>
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
        <div className="flex flex-col">
          <span className="tele-chart-title">P2P Mesh Network Traffic</span>
          <span className="tele-chart-sub">Auction bids, lease grants, yields and heartbeats exchanged between AMRs</span>
        </div>
      </div>
      <Sparkline
        data={msgHistory}
        color="#A855F7"
        width={500}
        height={88}
        label="PEER PACKETS / TICK"
        unit=" msgs"
        fixedMin={0}
      />
    </div>
  );
}

// ── Lease timeline ────────────────────────────────────────────────────────

function LeaseTimeline({ holders, zone, colorOf, robots }: { holders: (string | null)[]; zone: string; colorOf: (id: string) => string; robots: RobotState[] }) {
  const recent = holders.slice(-60).map((holder) => ({ holder }));
  const w = 500;
  const h = 32;
  const blockW = w / Math.max(1, recent.length);

  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <div className="flex flex-col">
          <span className="tele-chart-title">{zone} Lease Timeline</span>
          <span className="tele-chart-sub">Single-lane mutex space-time reservation sequence (last 60 ticks)</span>
        </div>
      </div>

      <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
        <svg viewBox={`0 0 ${w} ${h}`} className="chart-svg" style={{ width: "100%", height: `${h}px`, borderRadius: "4px" }}>
          {/* Base track */}
          <rect x="0" y="0" width={w} height={h} fill="var(--bg-elevated)" rx="4" />

          {/* Lease segments */}
          {recent.map((entry, i) => {
            if (!entry.holder) return null;
            const color = colorOf(entry.holder);
            return (
              <rect
                key={i}
                x={i * blockW}
                y="0"
                width={Math.max(1, blockW)}
                height={h}
                fill={color}
                opacity="0.85"
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 font-mono text-[9px] text-[var(--text-muted)]">
          {robots.map((r) => (
            <div key={r.id} className="flex items-center gap-1.5">
              <span style={{ background: r.color, width: 8, height: 8, borderRadius: 2 }} />
              <span>{r.id}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5">
            <span style={{ border: "1px dashed var(--border-tactical)", width: 8, height: 8, borderRadius: 2, background: "var(--bg-elevated)" }} />
            <span>Idle / Free</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Throughput bar chart ──────────────────────────────────────────────────

function ThroughputChart({ completedByRobot, colorOf }: { completedByRobot: Record<string, number>; colorOf: (id: string) => string }) {
  const maxVal = Math.max(1, ...Object.values(completedByRobot));

  return (
    <div className="tele-chart-card">
      <div className="tele-chart-header">
        <div className="flex flex-col">
          <span className="tele-chart-title">Fleet Task Completion By AMR</span>
          <span className="tele-chart-sub">Missions each AMR has delivered since the floor was last reset</span>
        </div>
      </div>
      <div className="tele-bar-chart">
        {Object.entries(completedByRobot).map(([id, count]) => {
          const color = colorOf(id);
          const pct = Math.max(4, (count / maxVal) * 100);
          return (
            <div key={id} className="tele-bar-row">
              <span className="tele-bar-label" style={{ color, fontWeight: 700 }}>{id}</span>
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
  const { robots, fleetState, world, history, robotColor } = useFleetSocket();
  const zone = world?.mutex_zones[0] ?? "Corridor";
  const completedByRobot = Object.fromEntries(robots.map((r) => [r.id, r.completed]));

  const [activeTab, setActiveTab] = useState<"charts" | "comms">("charts");

  return (
    <div className="console-panel tele-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Network & Comms</h1>
          <span className="panel-subtitle">Real-time telemetry streams · inter-robot packet monitor</span>
        </div>
        <div className="panel-header-badges">
          <div className="filter-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`filter-tab${activeTab === "charts" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("charts")}
            >
              <Activity className="w-3.5 h-3.5 inline mr-1.5" />
              Metrics & Charts
            </button>
            <button
              className={`filter-tab${activeTab === "comms" ? " filter-tab-active" : ""}`}
              onClick={() => setActiveTab("comms")}
            >
              <Radio className="w-3.5 h-3.5 inline mr-1.5" />
              Packet &amp; Event Log
            </button>
          </div>
          <span className="badge badge-mono">TICK {fleetState?.tick ?? 0}</span>
          <span className="badge badge-mono">MSG {fleetState?.messages ?? 0}</span>
        </div>
      </div>

      <FleetStatusBanner />

      {activeTab === "comms" ? (
        <CommsPanel />
      ) : (
        <>
          <div className="tele-charts-grid">
            <BatteryTrendChart history={history.battery} robots={robots} />
            <ThroughputChart completedByRobot={completedByRobot} colorOf={robotColor} />
            <MessageRateChart msgHistory={history.messageRate.length ? history.messageRate : [0]} />
            <LeaseTimeline holders={history.leaseHolder} zone={zone} colorOf={robotColor} robots={robots} />
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
                    <td style={{ color: r.color, fontFamily: "var(--font-mono)" }}>{r.id}</td>
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
