"use client";

import { useState } from "react";
import Link from "next/link";
import type { RobotId } from "@/lib/fleet-contract";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { playClick, playChirp } from "@/lib/sound-effects";

interface HeroSectionProps {
  reservation: RobotId | null;
}

interface Hotspot {
  id: string;
  name: string;
  role: string;
  xPercent: number;
  yPercent: number;
  status: "nominal" | "leased" | "yielding";
  speed: string;
  battery: string;
  computeLoad: string;
  note: string;
}

const HERO_HOTSPOTS: Hotspot[] = [
  {
    id: "amr-14",
    name: "AMR-01 (Unit 14)",
    role: "Pallet Transport AMR",
    xPercent: 52,
    yPercent: 68,
    status: "leased",
    speed: "1.4 m/s",
    battery: "88.4%",
    computeLoad: "12% (Jetson Orin)",
    note: "Holding Space-Time Lease for Corridor C-14. Trajectory verified clear.",
  },
  {
    id: "corridor-c14",
    name: "Corridor C-14 Mutex Zone",
    role: "Single-Lane Chokepoint",
    xPercent: 67,
    yPercent: 58,
    status: "nominal",
    speed: "N/A",
    battery: "Grid Powered",
    computeLoad: "Distributed V2V",
    note: "Decentralized space-time exclusion envelope. Prevents head-on deadlock.",
  },
  {
    id: "amr-courier",
    name: "AMR-02 (Unit 08)",
    role: "High-Speed Courier",
    xPercent: 84,
    yPercent: 64,
    status: "yielding",
    speed: "0.0 m/s (Yielding)",
    battery: "94.1%",
    computeLoad: "9% (RPi 5)",
    note: "Safely staged at Standby Waypoint. Will enter corridor after AMR-01 clears.",
  },
];

export function HeroSection({ reservation }: HeroSectionProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  return (
    <section
      id="overview"
      className="content-section hero-container"
      style={{
        paddingTop: 42,
        paddingBottom: 40,
        position: "relative",
      }}
    >
      {/* Unified Technical Context Breadcrumb */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "5px 14px",
          borderRadius: 9999,
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-tactical)",
          fontSize: 12,
          fontFamily: "var(--font-mono)",
          color: "var(--text-secondary)",
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>SIH 2026 // PS-26123</span>
        <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>&bull;</span>
        <span>Bharat Electronics Limited Benchmark</span>
        <span style={{ color: "var(--text-muted)", opacity: 0.5 }}>&bull;</span>
        <span>ISO 3691-4:2023 Compliant</span>
      </div>

      {/* Main Hero Headline */}
      <h1
        style={{
          marginBottom: 20,
          maxWidth: 960,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.15,
        }}
      >
        Distributed Edge-AI Fleet Coordination for Autonomous Mobile Robots
      </h1>

      {/* Value Proposition Lead */}
      <p
        style={{
          fontSize: 17,
          color: "var(--text-secondary)",
          maxWidth: 860,
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        Eliminate single-point-of-failure cloud dispatchers. EdgeFleet deploys lightweight, deterministic peer
        coordination agents directly onto AMR microcomputers. Robots negotiate single-lane corridor leases across a
        local ROS 2 / Zenoh peer mesh, dynamically detour around blocked aisles, and auction task handoffs in &lt;84ms
        with zero cloud dependency.
      </p>

      {/* Primary Hero CTAs */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 38 }}>
        <a
          href="#simulator"
          className="btn btn-primary"
          style={{ padding: "12px 24px", fontSize: 14 }}
          onClick={() => playClick()}
        >
          Launch Floor Simulator &rarr;
        </a>

        <a
          href="#workflow"
          className="btn btn-secondary"
          style={{ padding: "12px 22px", fontSize: 14 }}
          onClick={() => playClick()}
        >
          Explore Workflow &rarr;
        </a>

        <Link
          href="/console"
          className="btn btn-secondary"
          id="btn-operator-console-hero"
          style={{ padding: "12px 22px", fontSize: 14 }}
          onClick={() => playClick()}
        >
          Operator Console &rarr;
        </Link>
      </div>

      {/* Metric Strip (Clean, Architectural, Zero Distracting Lines) */}
      <div className="metric-strip" style={{ marginBottom: 28 }}>
        <SpotlightCard className="metric-card interactive-card">
          <div className="metric-card-label">Peer Mesh Quorum</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--status-nominal)" }}>
              <AnimatedCounter value={3} /> / 3
            </span>
            <span className="metric-card-unit">AMRs</span>
          </div>
          <div className="metric-card-subtext">Direct V2V peer mesh online</div>
        </SpotlightCard>

        <SpotlightCard className="metric-card interactive-card">
          <div className="metric-card-label">Choke Arbiter (C-14)</div>
          <div className="metric-card-value">
            <span
              className="mono-metric"
              style={{
                color: reservation ? "var(--status-warning)" : "var(--status-nominal)",
              }}
            >
              {reservation ? `LEASED [${reservation}]` : "OPEN"}
            </span>
          </div>
          <div className="metric-card-subtext">Autonomous space-time mutex</div>
        </SpotlightCard>

        <SpotlightCard className="metric-card interactive-card">
          <div className="metric-card-label">P95 Decision Latency</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--text-primary)" }}>
              &lt; <AnimatedCounter value={42} />
            </span>
            <span className="metric-card-unit">ms</span>
          </div>
          <div className="metric-card-subtext">Zero cloud round-trip delay</div>
        </SpotlightCard>

        <SpotlightCard className="metric-card interactive-card">
          <div className="metric-card-label">Safety Violations</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--status-nominal)" }}>
              <AnimatedCounter value={0} />
            </span>
            <span className="metric-card-unit">Events</span>
          </div>
          <div className="metric-card-subtext">ISO 3691-4 Cat-3 verified</div>
        </SpotlightCard>
      </div>

      {/* Purpose-Built Industrial Hero Visual with Interactive Live Hotspots */}
      <div
        className="hero-visual-frame"
        style={{
          borderRadius: 12,
          overflow: "hidden",
          border: "1px solid var(--border-tactical)",
          boxShadow: "var(--shadow-elevated)",
          backgroundColor: "var(--bg-elevated)",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 540 }}>
          <img
            src="/images/hero-amr-fleet.jpg"
            alt="Autonomous mobile robots (AMRs) transporting pallets in a smart industrial warehouse with high-bay racking and floor navigation grid"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Interactive Live Hotspots on the AMRs (Minimalist Tactical Pins) */}
          {HERO_HOTSPOTS.map((hotspot) => {
            const isSelected = activeHotspot?.id === hotspot.id;

            return (
              <div
                key={hotspot.id}
                style={{
                  position: "absolute",
                  left: `${hotspot.xPercent}%`,
                  top: `${hotspot.yPercent}%`,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10,
                }}
              >
                {/* Tactical Pin Target */}
                <button
                  type="button"
                  onClick={() => {
                    playChirp();
                    setActiveHotspot(isSelected ? null : hotspot);
                  }}
                  onMouseEnter={() => {
                    setActiveHotspot(hotspot);
                  }}
                  className={`hero-hotspot-pin ${hotspot.status} ${isSelected ? "active" : ""}`}
                  aria-label={`Inspect ${hotspot.name}`}
                  title={`Click to inspect ${hotspot.name}`}
                >
                  <span className="hotspot-core" />
                </button>

                {/* Tactical Telemetry Popover */}
                {isSelected && (
                  <div
                    className="hero-hotspot-popover glass-panel"
                    style={{
                      position: "absolute",
                      bottom: "135%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: 260,
                      padding: "12px 14px",
                      borderRadius: 8,
                      zIndex: 20,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {hotspot.name}
                      </span>
                      <span
                        className="mono-tag"
                        style={{
                          fontSize: 9,
                          color:
                            hotspot.status === "leased"
                              ? "var(--status-nominal)"
                              : hotspot.status === "yielding"
                              ? "var(--status-warning)"
                              : "var(--text-muted)",
                        }}
                      >
                        {hotspot.status.toUpperCase()}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 8 }}>
                      {hotspot.role}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 10.5, fontFamily: "var(--font-mono)", marginBottom: 8 }}>
                      <div>Speed: <strong style={{ color: "var(--text-primary)" }}>{hotspot.speed}</strong></div>
                      <div>Battery: <strong style={{ color: "var(--text-primary)" }}>{hotspot.battery}</strong></div>
                      <div style={{ gridColumn: "span 2" }}>Compute: <strong style={{ color: "var(--text-primary)" }}>{hotspot.computeLoad}</strong></div>
                    </div>

                    <p style={{ fontSize: 11, color: "var(--text-secondary)", lineHeight: 1.35, margin: 0 }}>
                      {hotspot.note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Authoritative Fleet Status Strip (Cleanly Docked Directly Below Image) */}
        <div
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            borderTop: "1px solid var(--border-tactical)",
            backgroundColor: "var(--bg-surface)",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--status-nominal)" }} />
            <span style={{ fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              PEER MESH ACTIVE // ZONE 02
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 11.5 }}>
              Direct peer coordination across 3 industrial AMRs
            </span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              color: "var(--text-secondary)",
              flexWrap: "wrap",
            }}
          >
            <span>
              Corridor C-14: <strong style={{ color: reservation ? "var(--status-warning)" : "var(--status-nominal)" }}>{reservation ? `LEASED [${reservation}]` : "FREE"}</strong>
            </span>
            <span>
              P95 Latency: <strong style={{ color: "var(--text-primary)" }}>&lt;42ms</strong>
            </span>
            <span>
              Hardware: <strong style={{ color: "var(--text-primary)" }}>RPi 5 / Jetson Orin</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
