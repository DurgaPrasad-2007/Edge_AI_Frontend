"use client";

/**
 * MapPanel — Live 2D Warehouse Digital Twin & Real-time Peer-to-Peer Mesh Monitor
 * Features:
 * - High-Fidelity 2D Floor Twin adopted from the Flagship Landing Page
 * - Full interactive SimulatorControls (Run/Pause, Reset Floor, Inject/Clear Obstacle, Radar & Heatmap toggles)
 * - Space-time single-lane mutex lease visualization on Corridor C-14 with ISO 3691-4 hold lines
 * - Dynamic D* Lite rerouting around blocked aisle B-07
 * - Directional LiDAR sweeps, safety clearance zones & AMR status badges
 * - Click-to-inspect Tactical RobotHudModal
 * - Real-time consensus latency sparkline chart & P2P Zenoh packet dialogue stream
 */

import { useState, useEffect } from "react";
import { Radio, Wifi, ShieldAlert, Cpu, Play, AlertTriangle, Lock, Unlock, ArrowRight } from "lucide-react";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { useFleetSocket, type RobotState } from "@/lib/use-fleet-socket";
import { WarehouseMap } from "@/components/digital-twin/warehouse-map";
import { SimulatorControls } from "@/components/digital-twin/simulator-controls";
import { LiveTelemetryChart } from "@/components/digital-twin/live-telemetry-chart";
import { RobotHudModal } from "@/components/digital-twin/robot-hud-modal";
import { playClick, playChirp, playWarning, playRadarPing, playLeaseAcquired } from "@/lib/sound-effects";

export function MapPanel() {
  const {
    robots,
    fleetState,
    world,
    p2pMessages,
    connectionMode,
    sendControl,
    injectBlockage,
    robotColor,
  } = useFleetSocket();
  const aisleId = world?.nodes.find((n) => /aisle/i.test(n.id))?.id ?? "B-07";
  const blockedLabels = (fleetState?.blocked_nodes ?? []).map((id) => world?.nodes.find((n) => n.id === id)?.label ?? id);

  const [inspectedRobot, setInspectedRobot] = useState<RobotState | null>(null);
  const [showRadar, setShowRadar] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showP2PHud, setShowP2PHud] = useState(true);

  // Keep inspected robot in sync with live real telemetry stream
  useEffect(() => {
    if (inspectedRobot) {
      const match = robots.find((r) => r.id === inspectedRobot.id);
      if (match) setInspectedRobot(match);
    }
  }, [robots, inspectedRobot]);

  const isRunning = Boolean(fleetState?.running);
  const isBlocked = Boolean(fleetState?.aisle_blocked);

  const handleToggleRunning = () => {
    playClick();
    void sendControl(isRunning ? "pause" : "start");
  };

  const handleResetFloor = () => {
    playChirp();
    void sendControl("reset");
  };

  const handleInjectBlockage = () => {
    if (isBlocked) playChirp();
    else playWarning();
    void injectBlockage(aisleId);
  };

  const handleToggleRadar = () => {
    playRadarPing();
    setShowRadar((prev) => !prev);
  };

  const handleToggleHeatmap = () => {
    playClick();
    setShowHeatmap((prev) => !prev);
  };

  const handleSelectRobot = (robot: RobotState) => {
    playChirp();
    setInspectedRobot(robot);
  };

  return (
    <div className="console-panel map-panel" style={{ padding: "20px 24px" }}>
      {/* ── Console Header ── */}
      <div className="panel-header" style={{ marginBottom: 18 }}>
        <div className="panel-title-group">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--solar-terracotta)",
                fontFamily: "var(--font-mono)",
              }}
            >
              Floor Digital Twin // SIH 26123
            </span>
          </div>
          <h1 className="panel-title" style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>
            Live Warehouse Map
          </h1>
          <span className="panel-subtitle" style={{ fontSize: 12, color: "var(--text-secondary)" }}>
            Live view of the coordinator's warehouse graph · node reservations · corridor leases · A* replanning
          </span>
        </div>

        <div className="panel-header-badges" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="filter-tab"
            style={{ fontSize: 11, padding: "5px 10px" }}
            onClick={() => setShowP2PHud((prev) => !prev)}
            title="Toggle P2P Inter-AMR Packet Stream"
          >
            {showP2PHud ? "Hide P2P Dialogue" : "Show P2P Dialogue"}
          </button>

          <span className={`badge badge-${connectionMode === "live" ? "live" : "sim"}`}>
            {connectionMode === "live" ? "● LIVE WS" : "○ OFFLINE"}
          </span>

          {isRunning && (
            <span className="badge badge-running inline-flex items-center gap-1.5" style={{ backgroundColor: "rgba(16, 185, 129, 0.15)", color: "#10B981", border: "1px solid #10B981" }}>
              <Play className="w-2.5 h-2.5 fill-current" /> RUNNING
            </span>
          )}

          {isBlocked && (
            <span className="badge badge-warn inline-flex items-center gap-1.5" style={{ backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#EF4444", border: "1px solid #EF4444" }}>
              <AlertTriangle className="w-2.5 h-2.5" /> {blockedLabels.join(", ").toUpperCase()} BLOCKED
            </span>
          )}
        </div>
      </div>

      <FleetStatusBanner />

      {/* ── Main Simulator Twin ── */}
      <div className="simulator-map-wrap" style={{ position: "relative", maxWidth: 1360, margin: "0 auto", width: "100%" }}>
        <SimulatorControls
          isRunning={isRunning}
          onToggleRunning={handleToggleRunning}
          onReset={handleResetFloor}
          onInjectBlockage={handleInjectBlockage}
          aisleBlocked={isBlocked}
          robots={robots}
          showRadar={showRadar}
          onToggleRadar={handleToggleRadar}
          showHeatmap={showHeatmap}
          onToggleHeatmap={handleToggleHeatmap}
          aisleLabel={world?.nodes.find((n) => n.id === aisleId)?.label}
          disabled={connectionMode !== "live"}
        />

        {/* High-Fidelity 2D Warehouse Digital Twin Floor Map */}
        <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <WarehouseMap
            world={world}
            robots={robots}
            leases={fleetState?.leases ?? {}}
            blockedNodes={fleetState?.blocked_nodes ?? []}
            p2p={p2pMessages}
            showRadar={showRadar}
            showHeatmap={showHeatmap}
            showP2PBeams={true}
            onSelectRobot={handleSelectRobot}
            style={{ maxHeight: "min(68vh, 620px)", width: "100%", maxWidth: "100%", margin: "0 auto" }}
          />
        </div>

        {/* Real-time Telemetry & Latency Sparkline Chart */}
        <LiveTelemetryChart isRunning={isRunning} messages={fleetState?.messages ?? 0} />

        {/* Informational Sub-footer Strip */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 8,
            fontSize: 12,
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            paddingTop: 12,
            marginTop: 4,
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <span>
            Control cycle: {world ? Math.round(world.config.control_period_s * 1000) : "—"}ms tick &middot; peer packets exchanged: {fleetState?.messages ?? 0}
          </span>
          <span>Routing: A* replanned on every blockage &middot; reservations: node look-ahead + corridor leases</span>
        </div>
      </div>

      {/* ── P2P Mesh Packet Stream HUD (Zenoh Direct Discovery) ── */}
      {showP2PHud && (
        <div
          className="card-hairline"
          style={{
            marginTop: 16,
            maxWidth: 1360,
            marginLeft: "auto",
            marginRight: "auto",
            padding: "12px 16px",
            backgroundColor: "var(--bg-elevated)",
            borderRadius: 8,
            border: "1px solid var(--border-tactical)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 800, fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
              LIVE INTER-ROBOT PACKET STREAM
            </span>
            <span style={{ fontSize: 10, color: "var(--status-active, #10B981)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
              {p2pMessages.length === 0 ? "○ NO PACKETS YET" : `● ${p2pMessages.length} RECENT PACKETS`}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10 }}>
            {p2pMessages.slice(0, 3).map((pkt) => (
              <div
                key={pkt.id}
                style={{
                  backgroundColor: "var(--bg-surface)",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid var(--border-subtle)",
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, color: robotColor(pkt.sender) }}>
                    {pkt.sender} ➔ {pkt.recipient}
                  </span>
                  <span style={{ fontSize: 10 }}>{pkt.timestamp}</span>
                </div>
                <div style={{ color: "var(--text-primary)", fontWeight: 600, wordBreak: "break-all", fontSize: 10.5 }}>
                  <span style={{ color: "var(--solar-terracotta)" }}>[{pkt.type}]</span> {pkt.payload}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Bottom Fleet KPI Stats Row ── */}
      <div className="map-bottom-stats" style={{ marginTop: 16, maxWidth: 1360, marginLeft: "auto", marginRight: "auto" }}>
        <div className="map-stat">
          <span>SIM TICK</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fleetState?.tick ?? 0}</span>
        </div>
        <div className="map-stat">
          <span>P2P MSGS</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fleetState?.messages ?? 0}</span>
        </div>
        <div className="map-stat">
          <span>COMPLETED</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700 }}>{fleetState?.completed_tasks ?? 0}</span>
        </div>
        <div className="map-stat">
          <span>COLLISIONS</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: (fleetState?.collision_count ?? 0) > 0 ? "#EF4444" : "#10B981",
            }}
          >
            {fleetState?.collision_count ?? 0}
          </span>
        </div>
        <div className="map-stat">
          <span>{(world?.mutex_zones[0] ?? "MUTEX ZONE").toUpperCase()}</span>
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: fleetState?.reservation ? "var(--solar-terracotta)" : "#10B981",
            }}
          >
            {fleetState?.reservation ? (
              <>
                <Lock className="w-3 h-3 text-[var(--solar-terracotta)]" />
                <span>LEASED · {fleetState.reservation}</span>
              </>
            ) : (
              <>
                <Unlock className="w-3 h-3 text-[#10B981]" />
                <span>OPEN // IDLE</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* ── Interactive Robot HUD Inspection Modal ── */}
      {inspectedRobot && (
        <RobotHudModal
          robot={inspectedRobot}
          onClose={() => setInspectedRobot(null)}
        />
      )}
    </div>
  );
}
