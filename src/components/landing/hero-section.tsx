"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, Copy, Check, ShieldCheck, Radio, ArrowRight } from "lucide-react";
import type { RobotId } from "@/lib/fleet-contract";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { ContainerScroll } from "@/components/ui/container-scroll";
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
  const [copiedCli, setCopiedCli] = useState(false);

  const cliCommand = "zenoh-bridge-ros2dds -c /etc/edgefleet/mesh.json5";

  const handleCopyCli = () => {
    playClick();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(cliCommand);
      setCopiedCli(true);
      setTimeout(() => setCopiedCli(false), 2000);
    }
  };

  return (
    <section
      id="overview"
      className="content-section hero-container"
      style={{
        paddingTop: 36,
        paddingBottom: 48,
        position: "relative",
      }}
    >
      {/* 21st.dev Style Industrial Specification Kicker */}
      <div className="technical-kicker-bar" style={{ marginBottom: 20 }}>
        <span className="kicker-tag">SIH 2026 // PS-26123</span>
        <span className="kicker-sep">/</span>
        <span className="kicker-item">Bharat Electronics Limited (BEL) Benchmark</span>
        <span className="kicker-sep">/</span>
        <span className="kicker-item kicker-active">
          <span className="kicker-dot" /> Evaluation Architecture &middot; Software-First
        </span>
      </div>

      {/* Signature 21st.dev Two-Tone Display Headline */}
      <h1 className="hero-display-title">
        <span className="text-display-muted">Distributed Edge-AI Fleet Coordination. </span>
        <span className="text-display-emphasis">Zero Central Cloud SPOF.</span>
      </h1>

      {/* Value Proposition Lead */}
      <p
        style={{
          fontSize: 17,
          color: "var(--text-secondary)",
          maxWidth: 860,
          lineHeight: 1.6,
          marginBottom: 28,
        }}
      >
        Eliminate single-point-of-failure cloud dispatchers. EdgeFleet deploys lightweight, deterministic peer
        coordination agents directly onto AMR microcomputers. Robots negotiate single-lane corridor leases across a
        local ROS 2 / Zenoh peer mesh, dynamically detour around blocked aisles, and auction task handoffs with p95 &lt; 150ms
        decision latency (~84ms observed in testbed) and zero cloud dependency.
      </p>

      {/* Primary CTAs & Developer CLI Quick-Action Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 36 }}>
        <a
          href="#simulator"
          className="btn btn-primary"
          style={{ padding: "11px 22px", fontSize: 13.5 }}
          onClick={() => playClick()}
        >
          Launch Floor Twin &rarr;
        </a>

        <a
          href="#protocol-flow"
          className="btn btn-secondary"
          style={{ padding: "11px 20px", fontSize: 13.5 }}
          onClick={() => playClick()}
        >
          Consensus Loop &rarr;
        </a>

        <Link
          href="/console"
          className="btn btn-secondary"
          id="btn-operator-console-hero"
          style={{ padding: "11px 20px", fontSize: 13.5 }}
          onClick={() => playClick()}
        >
          Operator Console &rarr;
        </Link>

        {/* 21st.dev Developer Quick Launch CLI Bar */}
        <div className="action-cli-bar" title="Direct peer mesh initialization command">
          <Terminal className="w-3.5 h-3.5 text-muted" />
          <code>{cliCommand}</code>
          <button
            type="button"
            onClick={handleCopyCli}
            aria-label="Copy mesh startup command"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "2px 4px",
              color: copiedCli ? "var(--solar-terracotta)" : "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            {copiedCli ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Metric Strip (21st.dev High Data-Density Hairline Cards) */}
      <div className="metric-strip" style={{ marginBottom: 32 }}>
        <div className="metric-card">
          <div className="metric-card-label">Peer Mesh Quorum</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--text-primary)" }}>
              <AnimatedCounter value={3} />
              <span style={{ color: "var(--solar-terracotta)", fontWeight: 700 }}> / 3</span>
            </span>
            <span className="metric-card-unit">AMRs</span>
          </div>
          <div className="metric-card-subtext">Direct V2V peer mesh online</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Choke Arbiter (C-14)</div>
          <div className="metric-card-value">
            <span
              className="mono-metric"
              style={{
                color: reservation ? "var(--status-warning)" : "var(--solar-terracotta)",
                fontSize: "19px",
                letterSpacing: "0.02em",
              }}
            >
              {reservation ? `LEASED [${reservation}]` : "OPEN // IDLE"}
            </span>
          </div>
          <div className="metric-card-subtext">Autonomous space-time mutex</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">P95 Decision Latency</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--text-primary)" }}>
              &lt; <AnimatedCounter value={150} />
            </span>
            <span className="metric-card-unit">ms</span>
          </div>
          <div className="metric-card-subtext">~84ms observed on local LAN</div>
        </div>

        <div className="metric-card">
          <div className="metric-card-label">Deadlocks &amp; Violations</div>
          <div className="metric-card-value">
            <span className="mono-metric" style={{ color: "var(--text-primary)" }}>
              <AnimatedCounter value={0} />
            </span>
            <span className="metric-card-unit">Events</span>
          </div>
          <div className="metric-card-subtext">ISO 3691-4 envelope aligned</div>
        </div>
      </div>

      {/* Singular Hero Object: Warehouse Fleet Visual with Interactive Tactical Hotspots (Dali Agency 3D Container Scroll) */}
      <ContainerScroll>
        <div
          className="hero-visual-frame card-hairline"
        style={{
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "var(--shadow-card)",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "auto", aspectRatio: "16/9", maxHeight: 540 }}>
          <img
            src="/images/hero-amr-fleet.jpg"
            alt="Autonomous mobile robots (AMRs) transporting pallets in a smart industrial warehouse with high-bay racking and floor navigation grid"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Interactive Live Hotspots on the AMRs */}
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

                {/* Tactical Telemetry Popover (Dual Mode Optimized) */}
                {isSelected && (
                  <div
                    className="hero-hotspot-popover glass-panel card-hairline"
                    style={{
                      position: "absolute",
                      bottom: "135%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      minWidth: 260,
                      padding: "12px 14px",
                      borderRadius: 8,
                      zIndex: 20,
                      boxShadow: "var(--shadow-elevated)",
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
                              ? "var(--solar-terracotta)"
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

        {/* Docked Authoritative Fleet Status Strip */}
        <div
          style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            borderTop: "1px solid var(--border-subtle)",
            backgroundColor: "var(--bg-surface)",
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "var(--solar-terracotta)", boxShadow: "0 0 6px rgba(194, 84, 26, 0.4)" }} />
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
              Corridor C-14: <strong style={{ color: reservation ? "var(--status-warning)" : "var(--text-primary)" }}>{reservation ? `LEASED [${reservation}]` : "FREE // OPEN"}</strong>
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
      </ContainerScroll>
    </section>
  );
}
