"use client";

import type { RobotState } from "@/lib/fleet-contract";
import { X, ShieldCheck, Battery, Navigation, Gauge, AlertTriangle, Cpu, Radio } from "lucide-react";

interface RobotHudModalProps {
  robot: RobotState | null;
  onClose: () => void;
}

export function RobotHudModal({ robot, onClose }: RobotHudModalProps) {
  if (!robot) return null;

  // Circular gauge calculations for battery % (Radius = 36)
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (robot.battery / 100) * circumference;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 90,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: 620,
          borderRadius: 12,
          padding: 24,
          backgroundColor: "var(--bg-surface)",
          boxShadow: "var(--shadow-elevated)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={`${robot.name} Tactical Telemetry HUD`}
      >
        {/* Header Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                backgroundColor: robot.color,
                color: "#FFFFFF",
                display: "grid",
                placeItems: "center",
                fontWeight: 800,
                fontSize: 16,
                fontFamily: "var(--font-mono)",
              }}
            >
              {robot.id.replace("AMR-", "R")}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                  {robot.id} &middot; {robot.name}
                </h3>
                <span className="badge badge-nominal" style={{ fontSize: 10 }}>
                  {robot.status}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                {robot.robot_class || "Industrial Automated Guided Vehicle"} &middot; Fleet {robot.fleet_id?.toUpperCase() || "ALPHA"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: "6px 10px" }}
            aria-label="Close Inspector"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Column Gauges & Metrics Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
          {/* Gauge 1: Battery Circular Progress Dial */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8 }}>
              Battery State
            </span>
            <div style={{ position: "relative", width: 88, height: 88, display: "grid", placeItems: "center" }}>
              <svg width="88" height="88" viewBox="0 0 88 88" style={{ transform: "rotate(-90deg)" }}>
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke="var(--bg-muted)"
                  strokeWidth="6"
                />
                <circle
                  cx="44"
                  cy="44"
                  r={radius}
                  fill="none"
                  stroke={robot.color}
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="hud-gauge-dial"
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span className="mono-metric" style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>
                  {Math.round(robot.battery)}%
                </span>
              </div>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 6 }}>
              Reserve: 20% Safe
            </span>
          </div>

          {/* Gauge 2: Velocity & Heading */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              Linear Velocity
            </span>
            <div style={{ textAlign: "center" }}>
              <Gauge className="w-8 h-8 text-blue-600 mb-1" style={{ margin: "0 auto" }} />
              <div className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                {robot.max_speed_mps || 1.4}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>m/s (Nominal)</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--text-secondary)", marginTop: 8 }}>
              Coordinates: ({robot.position.x}, {robot.position.y})
            </span>
          </div>

          {/* Gauge 3: Payload Capacity */}
          <div
            style={{
              padding: 16,
              borderRadius: 8,
              backgroundColor: "var(--bg-elevated)",
              border: "1px solid var(--border-tactical)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 12 }}>
              Payload Rating
            </span>
            <div style={{ textAlign: "center" }}>
              <Cpu className="w-8 h-8 text-amber-600 mb-1" style={{ margin: "0 auto" }} />
              <div className="mono-metric" style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)" }}>
                {robot.payload_capacity_kg || 800}
              </div>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>kg (Max Capacity)</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--status-nominal)", fontWeight: 600, marginTop: 8 }}>
              ISO 3691-4 Level B
            </span>
          </div>
        </div>

        {/* 4-Way LiDAR Proximity Safety Sensor Readout */}
        <div
          style={{
            padding: 14,
            borderRadius: 8,
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-tactical)",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
              LiDAR Safety Envelopes (360&deg; Time-of-Flight)
            </span>
            <span className="badge badge-nominal" style={{ fontSize: 10 }}>
              0.5m Envelope Clear
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, textAlign: "center" }}>
            <div style={{ padding: "6px 8px", backgroundColor: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>FRONT (N)</div>
              <div className="mono-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--status-nominal)" }}>
                3.84 m
              </div>
            </div>
            <div style={{ padding: "6px 8px", backgroundColor: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>REAR (S)</div>
              <div className="mono-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--status-nominal)" }}>
                2.42 m
              </div>
            </div>
            <div style={{ padding: "6px 8px", backgroundColor: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>LEFT (W)</div>
              <div className="mono-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--status-nominal)" }}>
                0.95 m
              </div>
            </div>
            <div style={{ padding: "6px 8px", backgroundColor: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 600 }}>RIGHT (E)</div>
              <div className="mono-metric" style={{ fontSize: 13, fontWeight: 700, color: "var(--status-nominal)" }}>
                1.12 m
              </div>
            </div>
          </div>
        </div>

        {/* Footer / Safety Boundary notice */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-secondary)" }}>
            <ShieldCheck className="w-4 h-4" style={{ color: "var(--solar-terracotta)" }} />
            <span>Telemetry Inspector &middot; SIL-2 Zero-Motion Observer</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-primary"
            style={{ padding: "7px 16px", fontSize: 12 }}
          >
            Dismiss Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
