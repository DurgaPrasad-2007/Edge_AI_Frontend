"use client";

import { useState } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import {
  playClick,
  playWarning,
  playLeaseAcquired,
  playChirp,
  playRadarPing,
} from "@/lib/sound-effects";
import {
  ShieldAlert,
  Cpu,
  Wifi,
  WifiOff,
  Zap,
  Radio,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sliders,
} from "lucide-react";

export function BentoGrid() {
  // Tile 1: Mutex Velocity Slider state
  const [amr1Speed, setAmr1Speed] = useState(1.4); // m/s
  const [amr2Speed, setAmr2Speed] = useState(1.1); // m/s

  // Tile 2: Cloud Severance state
  const [cloudDisconnected, setCloudDisconnected] = useState(false);

  // Tile 3: Protocol Inspector state
  const [activePacket, setActivePacket] = useState<"LEASE" | "ALERT" | "AUCTION" | "HEARTBEAT">("LEASE");

  // Tile 4: Lidar Proximity state
  const [obstacleDistance, setObstacleDistance] = useState(1.2); // meters

  // Calculate winner for Tile 1
  // Distance to choke is 12 meters
  const amr1Eta = (12 / amr1Speed).toFixed(1);
  const amr2Eta = (12 / amr2Speed).toFixed(1);
  const winner = parseFloat(amr1Eta) <= parseFloat(amr2Eta) ? "AMR-01" : "AMR-02";

  // Safety Zone calculation for Tile 4
  const safetyStatus =
    obstacleDistance < 0.5
      ? { label: "CAT-3 E-STOP (RELAY OPEN)", color: "var(--status-critical)", state: "emergency" }
      : obstacleDistance <= 1.5
      ? { label: "CREEP SPEED (0.4 m/s)", color: "var(--status-warning)", state: "warning" }
      : { label: "FULL SPEED (1.8 m/s)", color: "var(--status-nominal)", state: "nominal" };

  return (
    <section id="bento-architecture" className="content-section" style={{ paddingTop: 60, paddingBottom: 60 }}>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-kicker">Interactive Systems Intelligence</div>
        <h2 className="section-title">De-Risking AMRs with Distributed Edge Compute</h2>
        <p className="section-description">
          Experience the low-level mechanics of decentralized peer coordination. Interact with live corridor
          arbitration, test simulated cloud network outages, and inspect ROS 2 / Zenoh serialization benchmarks.
        </p>
      </div>

      {/* Modern 3-Column Bento Grid */}
      <div className="bento-grid">
        {/* TILE 1: Dynamic Corridor Mutex Simulator (Spans 2 Columns on desktop) */}
        <SpotlightCard className="bento-tile bento-tile-large">
          <div className="bento-tile-header">
            <div className="bento-tile-badge">
              <Clock className="w-3.5 h-3.5 text-muted" />
              <span>Space-Time Mutex Engine</span>
            </div>
            <span className="mono-tag">SIH-26123 // Algorithm 1</span>
          </div>

          <h3 className="bento-tile-title">Deterministic Corridor C-14 Arbitration</h3>
          <p className="bento-tile-desc">
            Adjust approach velocities below to observe real-time peer negotiation. The robot with earlier predicted
            spatial reservation window secures the corridor lease; the trailing unit autonomously yields.
          </p>

          {/* Interactive Dual Velocity Sliders */}
          <div className="interactive-slider-box">
            <div className="slider-row">
              <div className="slider-meta">
                <span className="slider-label">AMR-01 Approach Velocity</span>
                <span className="slider-value mono-metric">{amr1Speed.toFixed(1)} m/s (ETA: {amr1Eta}s)</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.1"
                value={amr1Speed}
                onChange={(e) => {
                  setAmr1Speed(parseFloat(e.target.value));
                  playClick();
                }}
                className="tactile-range"
                aria-label="AMR 01 Approach Velocity"
              />
            </div>

            <div className="slider-row">
              <div className="slider-meta">
                <span className="slider-label">AMR-02 Approach Velocity</span>
                <span className="slider-value mono-metric">{amr2Speed.toFixed(1)} m/s (ETA: {amr2Eta}s)</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.2"
                step="0.1"
                value={amr2Speed}
                onChange={(e) => {
                  setAmr2Speed(parseFloat(e.target.value));
                  playClick();
                }}
                className="tactile-range"
                aria-label="AMR 02 Approach Velocity"
              />
            </div>
          </div>

          {/* Live Dynamic Resolution Strip */}
          <div className="resolution-strip">
            <div className="resolution-card winner-card">
              <div className="res-badge">LEASE GRANTED</div>
              <div className="res-name">{winner}</div>
              <div className="res-note">Proceeds through Corridor C-14 uninterrupted</div>
            </div>

            <div className="res-arrow">
              <ArrowRight className="w-5 h-5 text-muted" />
            </div>

            <div className="resolution-card yield-card">
              <div className="res-badge">YIELD &amp; STAGE</div>
              <div className="res-name">{winner === "AMR-01" ? "AMR-02" : "AMR-01"}</div>
              <div className="res-note">Stages at Staging Waypoint W-14.2 (0 deadlock)</div>
            </div>
          </div>
        </SpotlightCard>

        {/* TILE 2: Cloud Severance & Zero-Downtime Peer Mesh */}
        <SpotlightCard className="bento-tile">
          <div className="bento-tile-header">
            <div className="bento-tile-badge">
              <Radio className="w-3.5 h-3.5 text-muted" />
              <span>Offline Resilience</span>
            </div>
            <span className={`status-pill ${cloudDisconnected ? "offline" : "online"}`}>
              {cloudDisconnected ? "CENTRAL CLOUD SEVERED" : "CLOUD NOMINAL"}
            </span>
          </div>

          <h3 className="bento-tile-title">Zero-SPOF Peer Continuity</h3>
          <p className="bento-tile-desc">
            Test what happens when the central WAN connection drops. EdgeFleet coordinates entirely on local V2V gossip.
          </p>

          {/* Severance Toggle Button */}
          <button
            type="button"
            onClick={() => {
              const next = !cloudDisconnected;
              setCloudDisconnected(next);
              if (next) playWarning();
              else playChirp();
            }}
            className={`tactile-test-btn ${cloudDisconnected ? "is-severed" : ""}`}
            style={{ width: "100%", margin: "16px 0" }}
          >
            {cloudDisconnected ? (
              <>
                <WifiOff className="w-4 h-4 text-rose-500" />
                <span>Cloud Severed &middot; Click to Restore</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 text-emerald-500" />
                <span>Click to Simulate Cloud Outage</span>
              </>
            )}
          </button>

          {/* Live Node Quorum State */}
          <div className="network-state-box">
            <div className="net-row">
              <span className="net-label">Cloud Dispatcher:</span>
              <span className={`mono-metric ${cloudDisconnected ? "text-rose-500" : "text-emerald-500"}`}>
                {cloudDisconnected ? "0% (DROPPED / 0ms ACK)" : "100% (REST API)"}
              </span>
            </div>
            <div className="net-row">
              <span className="net-label">Local P2P Zenoh Mesh:</span>
              <span className="mono-metric text-emerald-500 font-bold">100% ACTIVE (3 / 3 PEERS)</span>
            </div>
            <div className="net-row">
              <span className="net-label">Mission Degradation:</span>
              <span className="mono-metric text-emerald-500 font-bold">0.00% (ZERO DOWNTIME)</span>
            </div>
          </div>
        </SpotlightCard>

        {/* TILE 3: ROS 2 / Zenoh Binary Serialization Inspector */}
        <SpotlightCard className="bento-tile">
          <div className="bento-tile-header">
            <div className="bento-tile-badge">
              <Cpu className="w-3.5 h-3.5 text-muted" />
              <span>Micro-Protocol Bus</span>
            </div>
            <span className="mono-tag">CDR Serializer</span>
          </div>

          <h3 className="bento-tile-title">Zero-Copy V2V Telemetry</h3>
          <p className="bento-tile-desc">
            Ultra-compact ROS 2 / Zenoh packet serialization for low-bandwidth 5GHz warehouse environments.
          </p>

          {/* Packet Selector Tabs */}
          <div className="packet-tabs">
            {(["LEASE", "ALERT", "AUCTION", "HEARTBEAT"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`packet-tab-btn ${activePacket === tab ? "active" : ""}`}
                onClick={() => {
                  setActivePacket(tab);
                  playChirp();
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Raw Packet Inspector Box */}
          <div className="packet-inspector">
            <div className="packet-inspector-header">
              <span>CDR Binary Payload Preview</span>
              <span className="mono-tag">
                {activePacket === "LEASE" && "48 bytes"}
                {activePacket === "ALERT" && "36 bytes"}
                {activePacket === "AUCTION" && "64 bytes"}
                {activePacket === "HEARTBEAT" && "28 bytes"}
              </span>
            </div>
            <pre className="packet-code">
              {activePacket === "LEASE" &&
                `{
  "topic": "edgefleet/corridor/c14/lease",
  "holder": "AMR-01",
  "valid_until_tick": 8940,
  "velocity_mps": 1.4,
  "crc32": "0x8F21A4B9"
}`}
              {activePacket === "ALERT" &&
                `{
  "topic": "edgefleet/safety/aisle_b07",
  "event": "OBSTACLE_DETECTED",
  "grid_x": 500, "grid_y": 270,
  "action": "D_STAR_LITE_REPLAN",
  "crc32": "0x4C90B2E1"
}`}
              {activePacket === "AUCTION" &&
                `{
  "topic": "edgefleet/task/handover",
  "task_id": "BIN-PICK-772",
  "best_bidder": "AMR-02",
  "marginal_energy_cost_wh": 14.2,
  "crc32": "0x2D78FE03"
}`}
              {activePacket === "HEARTBEAT" &&
                `{
  "node_id": "AMR-03",
  "battery_pct": 84.6,
  "pos": [492, 274],
  "mesh_hop_count": 1,
  "crc32": "0x6A11D9FF"
}`}
            </pre>
          </div>
        </SpotlightCard>

        {/* TILE 4: ISO 3691-4 Dynamic Lidar Safety Envelope */}
        <SpotlightCard className="bento-tile bento-tile-large">
          <div className="bento-tile-header">
            <div className="bento-tile-badge">
              <ShieldAlert className="w-3.5 h-3.5 text-muted" />
              <span>Safety Regulation</span>
            </div>
            <span className="mono-tag">ISO 3691-4 / Cat 3</span>
          </div>

          <h3 className="bento-tile-title">Dynamic Radar &amp; Optical Safety Envelope</h3>
          <p className="bento-tile-desc">
            Drag the slider to bring a pedestrian or obstacle into the AMR&apos;s dynamic safety field. Observe how safety
            relays transition from nominal velocity to creep speed to category-3 hardware stop.
          </p>

          <div className="lidar-sim-box">
            <div className="slider-row" style={{ marginBottom: 18 }}>
              <div className="slider-meta">
                <span className="slider-label">Detected Obstacle Distance</span>
                <span className="slider-value mono-metric font-bold" style={{ color: safetyStatus.color }}>
                  {obstacleDistance.toFixed(2)} meters
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="2.5"
                step="0.05"
                value={obstacleDistance}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setObstacleDistance(val);
                  if (val < 0.5) playWarning();
                  else if (val <= 1.5) playRadarPing();
                  else playClick();
                }}
                className="tactile-range"
                aria-label="Obstacle Distance Slider"
              />
            </div>

            {/* Visual Safety Envelope Radar Ring */}
            <div className="safety-envelope-visual">
              <div className={`radar-concentric outer-zone ${obstacleDistance > 1.5 ? "active-zone" : ""}`}>
                <span className="zone-label">&gt;1.5m Free Motion Zone</span>
                <div className={`radar-concentric mid-zone ${obstacleDistance <= 1.5 && obstacleDistance >= 0.5 ? "active-zone" : ""}`}>
                  <span className="zone-label">0.5m-1.5m Creep Zone</span>
                  <div className={`radar-concentric inner-zone ${obstacleDistance < 0.5 ? "active-zone" : ""}`}>
                    <span className="zone-label">&lt;0.5m E-Stop Ring</span>
                    <div className="amr-core-dot" />
                  </div>
                </div>
              </div>

              {/* Dynamic Readout */}
              <div className="safety-readout" style={{ borderColor: safetyStatus.color }}>
                <div className="safety-readout-title" style={{ color: safetyStatus.color }}>
                  {safetyStatus.label}
                </div>
                <div className="safety-readout-sub">
                  Dynamic Braking Curve: {obstacleDistance < 0.5 ? "0.0 m/s² (Hardware cut)" : obstacleDistance <= 1.5 ? "0.8 m/s² (Smooth de-cel)" : "Nominal cruising"}
                </div>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
