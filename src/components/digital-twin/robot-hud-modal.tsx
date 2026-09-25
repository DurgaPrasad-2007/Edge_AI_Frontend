"use client";

import type { RobotState } from "@/lib/fleet-contract";
import { useFleetSocket } from "@/lib/use-fleet-socket";
import { X, ShieldCheck, Navigation, Cpu } from "lucide-react";

interface RobotHudModalProps {
  robot: RobotState | null;
  onClose: () => void;
}

const LEG_LABEL: Record<string, string> = {
  idle: "Docked / standby",
  to_pickup: "Heading to pickup",
  to_drop: "Delivering payload",
  to_home: "Returning to dock",
  to_charge: "Heading to charge bay",
};

const tile = {
  padding: 16,
  borderRadius: 8,
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border-tactical)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
} as const;

export function RobotHudModal({ robot, onClose }: RobotHudModalProps) {
  const { robots, world } = useFleetSocket();
  if (!robot) return null;

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (robot.battery / 100) * circumference;

  const lowBattery = world?.config.low_battery_pct;
  const batteryNote = lowBattery === undefined ? "" : robot.battery < lowBattery ? `Below ${lowBattery}% — seeks charge bay` : `Charge threshold ${lowBattery}%`;
  const capacity = robot.payload_capacity_kg ?? 0;
  const carried = robot.current_payload_kg ?? 0;
  const waypointsLeft = Math.max(0, robot.path.length - robot.path_index - 1);
  const peers = robots
    .filter((r) => r.id !== robot.id)
    .map((r) => ({ id: r.id, distance: Math.hypot(r.position.x - robot.position.x, r.position.y - robot.position.y) }))
    .sort((a, b) => a.distance - b.distance);
  const radiusLimit = world?.config.collision_radius ?? 0;
  const clear = peers.every((p) => p.distance > radiusLimit);

  return (
    <div
      style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0, 0, 0, 0.45)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{ width: "100%", maxWidth: 620, borderRadius: 12, padding: 24, backgroundColor: "var(--bg-surface)", boxShadow: "var(--shadow-elevated)", position: "relative" }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${robot.name} telemetry`}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: 8, backgroundColor: robot.color, color: "#FFFFFF", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 16, fontFamily: "var(--font-mono)" }}>
              {robot.id.replace("AMR-", "R")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                  {robot.id} &middot; {robot.name}
                </h3>
                <span className="badge badge-nominal" style={{ fontSize: 10 }}>{robot.status}</span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{robot.task}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="btn btn-secondary" style={{ padding: "6px 10px" }} aria-label="Close inspector">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          <div style={tile}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>Battery State</span>
            <div style={{ position: "relative", width: 88, height: 88, display: "grid", placeItems: "center" }}>
              <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--bg-muted)" strokeWidth="6" />
                <circle cx="44" cy="44" r={radius} fill="none" stroke={robot.color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="hud-gauge-dial" />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span className="mono-metric" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{Math.round(robot.battery)}%</span>
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>{batteryNote}</span>
          </div>

          <div style={tile}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Mission Leg</span>
            <div style={{ textAlign: "center" }}>
              <Navigation className="w-8 h-8 text-blue-600 mb-1" style={{ margin: "0 auto" }} />
              <div className="mono-metric" style={{ fontSize: 16, fontWeight: 800, color: "var(--text-primary)" }}>
                {LEG_LABEL[robot.leg ?? "idle"]}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                {robot.target ? `→ ${robot.target}` : "no active target"} &middot; {waypointsLeft} waypoints left
              </span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 8 }}>
              Position: ({Math.round(robot.position.x)}, {Math.round(robot.position.y)})
            </span>
          </div>

          <div style={tile}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>Payload</span>
            <div style={{ textAlign: "center" }}>
              <Cpu className="w-8 h-8 text-amber-600 mb-1" style={{ margin: "0 auto" }} />
              <div className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                {carried} / {capacity}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>kg carried / rated capacity</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--status-nominal)", fontWeight: 600, marginTop: 8 }}>
              {robot.completed} missions completed
            </span>
          </div>
        </div>

        <div style={{ padding: 14, borderRadius: 8, backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-tactical)", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>Peer Proximity (map units)</span>
            <span className={`badge ${clear ? "badge-nominal" : "badge-warn"}`} style={{ fontSize: 10 }}>
              {clear ? "Separation OK" : "Peer inside safety radius"}
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(1, Math.min(4, peers.length))}, 1fr)`, gap: 10, textAlign: "center" }}>
            {peers.map((p) => (
              <div key={p.id} style={{ padding: "6px 8px", backgroundColor: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
                <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>{p.id}</div>
                <div className="mono-metric" style={{ fontSize: 13, fontWeight: 700, color: p.distance > radiusLimit ? "var(--status-nominal)" : "#EF4444" }}>
                  {Math.round(p.distance)}
                </div>
              </div>
            ))}
            {peers.length === 0 && <div style={{ fontSize: 11, color: "var(--text-muted)" }}>No other AMRs registered.</div>}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
            <span>Read-only telemetry inspector &middot; the dashboard never drives motors</span>
          </div>
          <button type="button" onClick={onClose} className="btn btn-primary" style={{ padding: "7px 16px", fontSize: 12 }}>
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
