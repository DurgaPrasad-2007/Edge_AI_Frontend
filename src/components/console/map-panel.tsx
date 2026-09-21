"use client";

/**
 * MapPanel — Live 2D Warehouse Visualization & Real-time Dynamic P2P Mesh Inspector
 * Features:
 * - Real-time autonomous & live WebSocket simulation twin
 * - Working ▶ RUN, ⏸ PAUSE, ↺ RESET, and ⚠ INJECT OBSTACLE buttons
 * - Visual inter-AMR P2P communication beams & live packet transmission dialogue
 * - Space-time single-lane mutex lease visualization on Corridor C-14
 * - Dynamic D* Lite rerouting around blocked aisles
 * - Interactive robot inspector & telemetry tooltip
 */

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useFleetSocket, type RobotState, type RobotId } from "@/lib/use-fleet-socket";

// ── Robot Colors ──────────────────────────────────────────────────────────

const AMR_COLORS: Record<string, string> = {
  "AMR-01": "#C2541A",
  "AMR-02": "#F59E0B",
  "AMR-03": "#38BDF8",
};

const STATUS_BG: Record<string, string> = {
  Moving: "#10B981",
  "Task handoff": "#06B6D4",
  Rerouting: "#F59E0B",
  Yielding: "#A855F7",
  Charging: "#64748B",
  Blocked: "#EF4444",
};

// ── Building Layouts ──────────────────────────────────────────────────────

const BUILDINGS = {
  "dc-west": {
    name: "Zone A · High-Bay Logistics Hub",
    code: "DC-W02",
    racks: [
      { id: "R-A1", label: "RACK A-01 [BULK]", x: 150, y: 125, w: 120, h: 50 },
      { id: "R-A2", label: "RACK A-02 [PARTS]", x: 310, y: 125, w: 120, h: 50 },
      { id: "R-A3", label: "RACK A-03 [FAST]", x: 570, y: 125, w: 120, h: 50 },
      { id: "R-A4", label: "RACK A-04 [RESERVE]", x: 730, y: 125, w: 120, h: 50 },

      { id: "R-B1", label: "RACK B-01 [AVIONICS]", x: 150, y: 325, w: 120, h: 50 },
      { id: "R-B2", label: "RACK B-02 [ASSEMBLY]", x: 310, y: 325, w: 120, h: 50 },
      { id: "R-B3", label: "RACK B-03 [HARNESS]", x: 570, y: 325, w: 120, h: 50 },
      { id: "R-B4", label: "RACK B-04 [OPTICS]", x: 730, y: 325, w: 120, h: 50 },

      { id: "R-C1", label: "RACK C-01 [STAGING]", x: 150, y: 485, w: 120, h: 50 },
      { id: "R-C2", label: "RACK C-02 [FINISHED]", x: 310, y: 485, w: 120, h: 50 },
      { id: "R-C3", label: "RACK C-03 [BUFFER]", x: 570, y: 485, w: 120, h: 50 },
      { id: "R-C4", label: "RACK C-04 [PACKAGING]", x: 730, y: 485, w: 120, h: 50 },
    ],
    corridor: { id: "C-14", label: "CORRIDOR C-14 (1-WAY MUTEX)", x: 420, y: 242, w: 160, h: 56 },
    docks: [
      { id: "DOCK-W", label: "DOCK WEST\n(OUTBOUND)", x: 92, y: 270, type: "outbound" as const },
      { id: "DOCK-E", label: "DOCK EAST\n(INBOUND)", x: 908, y: 270, type: "inbound" as const },
      { id: "CHARGE", label: "CHARGE BAY", x: 500, y: 580, type: "charge" as const },
    ],
    waypoints: [
      { id: "WP-04", label: "WP-04", x: 410, y: 270 },
      { id: "WP-09", label: "WP-09", x: 590, y: 270 },
      { id: "WP-02", label: "WP-02", x: 500, y: 180 },
      { id: "WP-07", label: "WP-07", x: 500, y: 444 },
    ],
  },
};

const DOCK_COLORS = { inbound: "#10B981", outbound: "#06B6D4", charge: "#F59E0B" };

type TrailPoint = { x: number; y: number };

function RobotTooltip({ robot, x, y }: { robot: RobotState; x: number; y: number }) {
  const color = AMR_COLORS[robot.id] ?? "#06B6D4";
  return (
    <div className="map-tooltip" style={{ left: x + 16, top: y - 8 }}>
      <div className="map-tooltip-header" style={{ borderColor: color }}>
        <span style={{ color }}>{robot.id}</span>
        <span className="map-tooltip-name">{robot.name}</span>
      </div>
      <div className="map-tooltip-row"><span>Status</span><span style={{ color: STATUS_BG[robot.status] }}>{robot.status}</span></div>
      <div className="map-tooltip-row"><span>Battery</span><span>{Math.round(robot.battery)}%</span></div>
      <div className="map-tooltip-row"><span>Priority</span><span>{robot.priority}</span></div>
      <div className="map-tooltip-row"><span>Task</span><span className="map-tooltip-task">{robot.task}</span></div>
      <div className="map-tooltip-row"><span>Pos</span><span className="font-mono">{Math.round(robot.position.x)},{Math.round(robot.position.y)}</span></div>
      <div className="map-tooltip-row"><span>Completed</span><span>{robot.completed}</span></div>
    </div>
  );
}

// ── Main MapPanel ─────────────────────────────────────────────────────────

export function MapPanel() {
  const { session } = useAuth();
  const {
    robots,
    fleetState,
    p2pMessages,
    connectionMode,
    sendControl,
    injectBlockage,
  } = useFleetSocket(session?.access_token);

  const [hoveredRobot, setHoveredRobot] = useState<{ robot: RobotState; svgX: number; svgY: number } | null>(null);
  const [animTick, setAnimTick] = useState(0);
  const [showP2PHud, setShowP2PHud] = useState(true);
  const trailsRef = useRef<Record<string, TrailPoint[]>>({});
  const svgRef = useRef<SVGSVGElement>(null);

  // Pulse ticker for animations
  useEffect(() => {
    const t = setInterval(() => setAnimTick((n) => n + 1), 400);
    return () => clearInterval(t);
  }, []);

  // Build trails
  useEffect(() => {
    for (const r of robots) {
      const trail = trailsRef.current[r.id] ?? [];
      const last = trail[trail.length - 1];
      if (!last || Math.hypot(last.x - r.position.x, last.y - r.position.y) > 2) {
        trail.push({ x: r.position.x, y: r.position.y });
        if (trail.length > 40) trail.shift();
        trailsRef.current[r.id] = trail;
      }
    }
  }, [robots]);

  const building = BUILDINGS["dc-west"];
  const hasLease = Boolean(fleetState?.reservation);
  const isRunning = Boolean(fleetState?.running);
  const isBlocked = Boolean(fleetState?.aisle_blocked);
  const pulsePct = (animTick % 4) / 3;

  const r1 = robots.find((r) => r.id === "AMR-01");
  const r2 = robots.find((r) => r.id === "AMR-02");
  const r3 = robots.find((r) => r.id === "AMR-03");

  function handleSvgMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 1000 / rect.width;
    const scaleY = 640 / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;

    let found: RobotState | null = null;
    for (const r of robots) {
      if (Math.hypot(r.position.x - svgX, r.position.y - svgY) < 26) {
        found = r;
        break;
      }
    }
    if (found) {
      setHoveredRobot({ robot: found, svgX: e.clientX - rect.left, svgY: e.clientY - rect.top });
    } else {
      setHoveredRobot(null);
    }
  }

  return (
    <div className="console-panel map-panel">
      <div className="panel-header">
        <div className="panel-title-group">
          <h1 className="panel-title">Live Warehouse Map</h1>
          <span className="panel-subtitle">{building.name} · {building.code} · Zenoh DDS P2P Mesh</span>
        </div>
        <div className="map-controls">
          <button
            className={`map-ctrl-btn ${isRunning ? "map-ctrl-btn-active" : ""}`}
            style={{
              backgroundColor: isRunning ? "var(--status-active, #10B981)" : "transparent",
              color: isRunning ? "#FFFFFF" : "inherit",
              borderColor: isRunning ? "var(--status-active, #10B981)" : "var(--border-tactical)",
              fontWeight: 700,
            }}
            onClick={() => sendControl("start")}
          >
            ▶ RUN
          </button>
          <button
            className="map-ctrl-btn"
            style={{ fontWeight: 700 }}
            onClick={() => sendControl("pause")}
          >
            ⏸ PAUSE
          </button>
          <button
            className="map-ctrl-btn map-ctrl-btn-warn"
            style={{ fontWeight: 700 }}
            onClick={() => sendControl("reset")}
          >
            ↺ RESET
          </button>
          <button
            className={`map-ctrl-btn ${isBlocked ? "map-ctrl-btn-warn" : ""}`}
            style={{
              fontWeight: 700,
              backgroundColor: isBlocked ? "rgba(239, 68, 68, 0.2)" : "transparent",
              borderColor: isBlocked ? "#EF4444" : "var(--border-tactical)",
              color: isBlocked ? "#EF4444" : "inherit",
            }}
            onClick={() => injectBlockage("B-07")}
          >
            {isBlocked ? "CLEAR OBSTACLE" : "⚠ INJECT OBSTACLE"}
          </button>
          <button
            className="map-ctrl-btn"
            style={{ fontSize: 10, padding: "4px 8px" }}
            onClick={() => setShowP2PHud(!showP2PHud)}
          >
            {showP2PHud ? "HIDE P2P FEED" : "SHOW P2P FEED"}
          </button>
          <span className={`badge badge-${connectionMode === "live" ? "live" : "sim"}`}>
            {connectionMode === "live" ? "● LIVE WS" : "◎ AUTONOMOUS SIM"}
          </span>
        </div>
      </div>

      {/* AMR Legend & Status Strip */}
      <div className="map-legend">
        {robots.map((r) => (
          <div key={r.id} className="map-legend-item">
            <span className="map-legend-dot" style={{ background: AMR_COLORS[r.id] }} />
            <span>
              <strong>{r.id}</strong> ({r.name}): <span style={{ color: STATUS_BG[r.status] }}>{r.status}</span> · Pri:{r.priority} · Bat:{Math.round(r.battery)}%
            </span>
            {fleetState?.reservation === r.id && <span className="map-legend-badge">🔒 LEASED C-14</span>}
          </div>
        ))}
        {hasLease && (
          <div className="map-legend-item map-legend-lease">
            <span className="map-legend-dot" style={{ background: "#06B6D4" }} />
            <span>C-14 Space-Time Mutex: <strong>{fleetState?.reservation}</strong></span>
          </div>
        )}
      </div>

      {/* Main SVG Visualization */}
      <div className="map-svg-container" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          viewBox="0 0 1000 640"
          preserveAspectRatio="xMidYMid meet"
          className="map-svg"
          onMouseMove={handleSvgMouseMove}
          onMouseLeave={() => setHoveredRobot(null)}
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--map-grid, rgba(140,120,100,0.18))" strokeWidth="0.75" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="hazard-pattern" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#D97706" strokeWidth="4" />
              <line x1="5" y1="0" x2="5" y2="10" stroke="transparent" strokeWidth="4" />
            </pattern>
          </defs>

          {/* Base Floor */}
          <rect x="30" y="30" width="940" height="570" fill="var(--map-floor, #FBF9F5)" rx="10" />
          <rect x="30" y="30" width="940" height="570" fill="url(#grid)" rx="10" />
          <rect x="30" y="30" width="940" height="570" fill="none" stroke="var(--map-floor-border, #D1C4B2)" strokeWidth="1.5" rx="10" />

          {/* Transit Lanes */}
          <line x1="120" y1="270" x2="880" y2="270" stroke="var(--map-lane, rgba(180, 160, 135, 0.45))" strokeWidth="1" strokeDasharray="6,6" />
          <line x1="500" y1="90" x2="500" y2="550" stroke="var(--map-lane, rgba(180, 160, 135, 0.45))" strokeWidth="1" strokeDasharray="6,6" />
          <line x1="120" y1="415" x2="880" y2="415" stroke="var(--map-lane, rgba(180, 160, 135, 0.3))" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="720" y1="415" x2="720" y2="505" stroke="var(--map-lane, rgba(180, 160, 135, 0.3))" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="720" y1="505" x2="280" y2="505" stroke="var(--map-lane, rgba(180, 160, 135, 0.3))" strokeWidth="1" strokeDasharray="4,4" />
          <line x1="280" y1="505" x2="280" y2="415" stroke="var(--map-lane, rgba(180, 160, 135, 0.3))" strokeWidth="1" strokeDasharray="4,4" />

          {/* Warehouse Racks */}
          {building.racks.map((rack) => (
            <g key={rack.id}>
              <rect
                x={rack.x}
                y={rack.y}
                width={rack.w}
                height={rack.h}
                fill="var(--map-rack, #EFE8DD)"
                stroke="var(--map-rack-stroke, #B8A994)"
                strokeWidth="1.2"
                rx="5"
              />
              <text
                x={rack.x + rack.w / 2}
                y={rack.y + rack.h / 2 + 4}
                textAnchor="middle"
                fill="var(--map-rack-text, #2D241D)"
                fontSize="8.5"
                fontFamily="var(--font-mono)"
                fontWeight="700"
                letterSpacing="0.04em"
              >
                {rack.label}
              </text>
            </g>
          ))}

          {/* Safety Hold Line N-14 */}
          <rect x="460" y="174" width="80" height="8" fill="url(#hazard-pattern)" rx="1" />
          <rect x="460" y="174" width="80" height="8" fill="none" stroke="#D97706" strokeWidth="1" />
          <text x="500" y="168" textAnchor="middle" fill="#D97706" fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="800">
            HOLD LINE N-14
          </text>

          {/* Corridor C-14 Mutex Zone */}
          <rect
            x={building.corridor.x}
            y={building.corridor.y}
            width={building.corridor.w}
            height={building.corridor.h}
            fill={hasLease ? `rgba(194,84,26,${0.18 + pulsePct * 0.15})` : "var(--accent-amber-dim, rgba(194,84,26,0.08))"}
            stroke={hasLease ? "var(--accent-amber, #C2541A)" : "var(--border-focus, #C2541A)"}
            strokeWidth={hasLease ? 2.5 : 1.5}
            strokeDasharray={hasLease ? "none" : "5,4"}
            rx="6"
            style={{ transition: "fill 0.3s, stroke 0.3s" }}
          />
          <text
            x={building.corridor.x + building.corridor.w / 2}
            y={building.corridor.y + (hasLease ? 20 : 32)}
            textAnchor="middle"
            fill="var(--accent-amber, #C2541A)"
            fontSize="8.5"
            fontFamily="var(--font-mono)"
            fontWeight="800"
            letterSpacing="0.05em"
          >
            {building.corridor.label}
          </text>
          {hasLease && (
            <text
              x={building.corridor.x + building.corridor.w / 2}
              y={building.corridor.y + 38}
              textAnchor="middle"
              fill="var(--accent-amber, #C2541A)"
              fontSize="8"
              fontFamily="var(--font-mono)"
              fontWeight="800"
            >
              🔒 LEASED: {fleetState?.reservation}
            </text>
          )}

          {/* Docks */}
          {building.docks.map((dock) => (
            <g key={dock.id}>
              <rect
                x={dock.x - 38}
                y={dock.y - 20}
                width={76}
                height={40}
                fill="var(--map-dock, #F3ECE1)"
                stroke={DOCK_COLORS[dock.type]}
                strokeWidth="2"
                rx="6"
              />
              {dock.label.split("\n").map((line, li) => (
                <text
                  key={li}
                  x={dock.x}
                  y={dock.y - 4 + li * 13}
                  textAnchor="middle"
                  fill="var(--map-dock-text, #1E1814)"
                  fontSize="7.5"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                >
                  {line}
                </text>
              ))}
            </g>
          ))}

          {/* Waypoints */}
          {building.waypoints.map((wp) => (
            <g key={wp.id}>
              <circle cx={wp.x} cy={wp.y} r="7" fill="var(--bg-surface, #F5F2EC)" stroke="var(--accent-amber, #C2541A)" strokeWidth="1.5" />
              <circle cx={wp.x} cy={wp.y} r="2.5" fill="var(--accent-amber, #C2541A)" />
              <text x={wp.x} y={wp.y + 17} textAnchor="middle" fill="var(--text-primary, #1E1814)" fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="700">{wp.label}</text>
            </g>
          ))}

          {/* Aisle B-07 Obstacle Marker */}
          {isBlocked && (
            <g>
              <rect x="610" y="400" width="60" height="30" fill="rgba(239, 68, 68, 0.25)" stroke="#EF4444" strokeWidth="2" strokeDasharray="3 3" rx="4" />
              <circle cx="640" cy="415" r="20" fill="none" stroke="#EF4444" strokeWidth="1.5" opacity={0.6 + pulsePct * 0.4} />
              <path d="M 632 407 L 648 423 M 648 407 L 632 423" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
              <text x="640" y="445" textAnchor="middle" fill="#EF4444" fontSize="8" fontWeight="800" fontFamily="var(--font-mono)">
                AISLE B-07 BLOCKED
              </text>
            </g>
          )}

          {/* Robot Trajectory Paths */}
          {robots.map((r) => {
            if (!r.path || r.path.length < 2) return null;
            const color = AMR_COLORS[r.id] ?? "#06B6D4";
            const future = r.path.slice(r.path_index);
            if (future.length < 2) return null;
            const pts = future.map((p) => `${p.x},${p.y}`).join(" ");
            return (
              <polyline
                key={`path-${r.id}`}
                points={pts}
                fill="none"
                stroke={color}
                strokeWidth="2.5"
                strokeOpacity="0.6"
                strokeDasharray="6,4"
                strokeLinecap="round"
              />
            );
          })}

          {/* VISUAL P2P COMMUNICATION ARCS / BEAMS */}
          {isRunning && r1 && r2 && (
            <g opacity="0.85">
              <line
                x1={r1.position.x}
                y1={r1.position.y}
                x2={r2.position.x}
                y2={r2.position.y}
                stroke="#A855F7"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                opacity={0.5 + pulsePct * 0.5}
              />
              <circle
                cx={r1.position.x + (r2.position.x - r1.position.x) * pulsePct}
                cy={r1.position.y + (r2.position.y - r1.position.y) * pulsePct}
                r="3.5"
                fill="#A855F7"
              />
            </g>
          )}

          {isRunning && r1 && r3 && (
            <g opacity="0.85">
              <line
                x1={r1.position.x}
                y1={r1.position.y}
                x2={r3.position.x}
                y2={r3.position.y}
                stroke="#06B6D4"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                opacity={0.4 + (1 - pulsePct) * 0.5}
              />
              <circle
                cx={r1.position.x + (r3.position.x - r1.position.x) * (1 - pulsePct)}
                cy={r1.position.y + (r3.position.y - r1.position.y) * (1 - pulsePct)}
                r="3.5"
                fill="#06B6D4"
              />
            </g>
          )}

          {/* Active Robots */}
          {robots.map((r) => {
            const color = AMR_COLORS[r.id] ?? "#06B6D4";
            const hasLease2 = fleetState?.reservation === r.id;
            const isHovered = hoveredRobot?.robot.id === r.id;
            const statusColor = STATUS_BG[r.status] ?? "#64748B";

            return (
              <g
                key={r.id}
                style={{ cursor: "pointer", transition: "transform 0.5s ease-out" }}
                transform={`translate(${r.position.x},${r.position.y})`}
              >
                {/* Protective Safety Buffer */}
                <circle
                  r={isHovered ? 28 : 22}
                  fill={r.status === "Yielding" ? "rgba(168, 85, 247, 0.15)" : `${color}18`}
                  stroke={r.status === "Yielding" ? "#A855F7" : color}
                  strokeWidth="1.2"
                  strokeOpacity="0.6"
                  strokeDasharray={r.status === "Yielding" ? "2 2" : "4 4"}
                />

                {/* Mutex lease pulse */}
                {hasLease2 && (
                  <circle
                    r={20}
                    fill="none"
                    stroke="var(--accent-amber, #C2541A)"
                    strokeWidth="2.5"
                    strokeOpacity={0.7 + pulsePct * 0.3}
                  />
                )}

                {/* Chassis Body */}
                <circle r="13" fill="var(--bg-surface, #F5F2EC)" stroke={color} strokeWidth="2.5" />

                {/* Status indicator dot */}
                <circle
                  cx="8"
                  cy="-8"
                  r="3.5"
                  fill={statusColor}
                  stroke="var(--bg-surface, #F5F2EC)"
                  strokeWidth="1.5"
                />

                {/* AMR ID inside circle */}
                <text
                  y="3.5"
                  textAnchor="middle"
                  fill="var(--text-primary, #1B1715)"
                  fontSize="7.5"
                  fontFamily="var(--font-mono)"
                  fontWeight="800"
                >
                  {r.id.replace("AMR-", "")}
                </text>

                {/* Speech / State Bubble above robot */}
                <g transform="translate(0, -18)">
                  <rect
                    x="-34"
                    y="-12"
                    width="68"
                    height="13"
                    fill="var(--bg-surface, #F5F2EC)"
                    stroke={statusColor}
                    strokeWidth="1"
                    rx="3"
                  />
                  <text
                    y="-3"
                    textAnchor="middle"
                    fill="var(--text-primary, #1B1715)"
                    fontSize="7"
                    fontFamily="var(--font-mono)"
                    fontWeight="800"
                  >
                    {r.status.toUpperCase()}
                  </text>
                </g>

                {/* Battery Bar */}
                <rect x="-10" y="15" width="20" height="2.5" fill="rgba(0,0,0,0.15)" rx="1.2" />
                <rect
                  x="-10"
                  y="15"
                  width={20 * (r.battery / 100)}
                  height="2.5"
                  fill={r.battery < 25 ? "#DC2626" : r.battery < 50 ? "#C2541A" : "#16A34A"}
                  rx="1.2"
                />
              </g>
            );
          })}

          {/* Status bar */}
          <g>
            <rect x="30" y="608" width="940" height="22" fill="var(--bg-elevated, #ECE5DA)" stroke="var(--border-subtle, #E2DACD)" strokeWidth="1" rx="4" />
            <text x="45" y="623" fill="var(--text-primary, #38302A)" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="700">
              {robots.map((r) => `● ${r.id}: ${r.status.toUpperCase()} (${r.task.slice(0, 16)})`).join("   |   ")}
              {fleetState?.reservation ? `   |   🔒 C-14 LEASE: ${fleetState.reservation}` : "   |   🔓 C-14 FREE"}
              {isBlocked ? "   |   ⚠ B-07 OBSTACLE ACTIVE (D* DETOUR)" : ""}
            </text>
          </g>
        </svg>

        {/* Hover Tooltip */}
        {hoveredRobot && (
          <RobotTooltip
            robot={hoveredRobot.robot}
            x={hoveredRobot.svgX}
            y={hoveredRobot.svgY}
          />
        )}
      </div>

      {/* P2P MESH PACKET INTERACTION HUD (Visible Communication Factor) */}
      {showP2PHud && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 14px",
            backgroundColor: "var(--bg-elevated, #ECE5DA)",
            borderRadius: 8,
            border: "1px solid var(--border-tactical, #D1C4B2)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
              📡 LIVE P2P INTER-ROBOT MESH PACKET STREAM (ZENOH DIRECT DISCOVERY)
            </span>
            <span style={{ fontSize: 10, color: "var(--status-active, #10B981)", fontWeight: 700 }}>
              ● ZERO-CENTRAL-BROKER ARBITRATION ACTIVE
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 8 }}>
            {(p2pMessages.length > 0 ? p2pMessages.slice(0, 3) : [
              {
                id: "def-1",
                sender: "AMR-01",
                recipient: "MESH",
                type: "MUTEX_REQ",
                payload: "TRAVERSAL_INTENT[Corridor C-14, ETA=4.8s, Priority=75]",
                timestamp: "LIVE",
              },
              {
                id: "def-2",
                sender: "AMR-02",
                recipient: "AMR-01",
                type: "YIELD_ACK",
                payload: "YIELD_CONFIRM[Holding at N-14 line, Pri=52 < 75]",
                timestamp: "LIVE",
              },
              {
                id: "def-3",
                sender: "AMR-03",
                recipient: "MESH",
                type: "OBSTACLE_ALERT",
                payload: "D*_DETOUR[B-07 blocked -> perimeter detour accepted]",
                timestamp: "LIVE",
              },
            ]).map((pkt) => (
              <div
                key={pkt.id}
                style={{
                  backgroundColor: "var(--bg-surface, #F5F2EC)",
                  padding: "6px 10px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle, #E2DACD)",
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 2 }}>
                  <span style={{ fontWeight: 800, color: AMR_COLORS[pkt.sender] ?? "inherit" }}>
                    {pkt.sender} ➔ {pkt.recipient}
                  </span>
                  <span>{pkt.timestamp}</span>
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, wordBreak: "break-all" }}>
                  [{pkt.type}] {pkt.payload}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Stats Grid */}
      <div className="map-bottom-stats">
        <div className="map-stat"><span>SIM TICK</span><span>{fleetState?.tick ?? 0}</span></div>
        <div className="map-stat"><span>P2P MSGS</span><span>{fleetState?.messages ?? 0}</span></div>
        <div className="map-stat"><span>COMPLETED</span><span>{fleetState?.completed_tasks ?? 0}</span></div>
        <div className="map-stat"><span>COLLISIONS</span><span style={{ color: (fleetState?.collision_count ?? 0) > 0 ? "#EF4444" : "#10B981" }}>{fleetState?.collision_count ?? 0}</span></div>
        <div className="map-stat"><span>CORRIDOR</span><span style={{ color: fleetState?.reservation ? "#06B6D4" : "#10B981" }}>{fleetState?.reservation ? `LEASED · ${fleetState.reservation}` : "FREE"}</span></div>
      </div>
    </div>
  );
}
