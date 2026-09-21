"use client";

import React, { useState, useEffect } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { playClick, playChirp, playLeaseAcquired } from "@/lib/sound-effects";
import {
  Code2,
  Calculator,
  Copy,
  Check,
  CheckCircle2,
  Pause,
  Play,
} from "lucide-react";

interface CodeLineToken {
  text: string;
  type?: "comment" | "keyword" | "fn" | "str" | "val" | "plain";
}

interface Step {
  id: number;
  title: string;
  badge: string;
  latency: string;
  description: string;
  technicalDetails: string[];
  packetTopic: string;
  codeSnippet: {
    rawCode: string;
    lines: CodeLineToken[][];
  };
  mathData: {
    label: string;
    displayFormula: React.ReactNode;
    variables: { symbol: string; meaning: string }[];
  };
}

const steps: Step[] = [
  {
    id: 1,
    title: "1. 3D Spatial LiDAR Perception",
    badge: "20Hz Scan Cycle",
    latency: "~15ms scan & cluster",
    description: "Onboard solid-state LiDAR continuously sweeps the warehouse aisle, identifying static obstacles, pallet overhangs, or workers.",
    technicalDetails: [
      "Voxel grid spatial clustering at 0.05m resolution",
      "Dynamic obstacle velocity tracking via onboard Kalman Filter",
      "Engineered to ISO 3691-4 clearance principles (0.5m lateral envelope)",
    ],
    packetTopic: "sensor_msgs/msg/LaserScan",
    codeSnippet: {
      rawCode: `# 1. LiDAR Pointcloud Euclidean Clustering (ISO 3691-4)
clusters = dbscan.fit(pointcloud, eps=0.35, min_pts=12)
hazard = any(c.in_corridor and c.dist < 0.50 for c in clusters)
if hazard:
    trigger_safety_halt(node=self.id, stop_dist_m=0.5)`,
      lines: [
        [{ text: "# 1. LiDAR Pointcloud Euclidean Clustering (ISO 3691-4)", type: "comment" }],
        [
          { text: "clusters = dbscan.", type: "plain" },
          { text: "fit", type: "fn" },
          { text: "(pointcloud, ", type: "plain" },
          { text: "eps", type: "keyword" },
          { text: "=0.35, ", type: "plain" },
          { text: "min_pts", type: "keyword" },
          { text: "=12)", type: "plain" },
        ],
        [
          { text: "hazard = ", type: "plain" },
          { text: "any", type: "fn" },
          { text: "(c.in_corridor ", type: "plain" },
          { text: "and", type: "keyword" },
          { text: " c.dist < 0.50 ", type: "plain" },
          { text: "for", type: "keyword" },
          { text: " c ", type: "plain" },
          { text: "in", type: "keyword" },
          { text: " clusters)", type: "plain" },
        ],
        [
          { text: "if", type: "keyword" },
          { text: " hazard:\n    ", type: "plain" },
          { text: "trigger_safety_halt", type: "fn" },
          { text: "(node=self.id, stop_dist_m=0.5)", type: "plain" },
        ],
      ],
    },
    mathData: {
      label: "Spatial Clearance Envelope Formulation:",
      displayFormula: (
        <span>
          C<sub>obs</sub> = &#123; <em>p</em> &isin; &#8477;<sup>3</sup> | &#8214;<em>p</em> &minus; <em>p</em><sub>amr</sub>&#8214;<sub>2</sub> &le; <em>R</em><sub>safety</sub> + <em>v</em> &middot; <em>t</em><sub>brake</sub> &#125;
        </span>
      ),
      variables: [
        { symbol: "R_safety", meaning: "Minimum dynamic lateral envelope (0.50m safety margin)" },
        { symbol: "v · t_brake", meaning: "Dynamic braking distance under payload inertia" },
        { symbol: "p_amr", meaning: "Spatial centroid of the Autonomous Mobile Robot" },
      ],
    },
  },
  {
    id: 2,
    title: "2. ROS 2 / Zenoh Peer Wire Mesh",
    badge: "Ad-Hoc 5GHz Wi-Fi",
    latency: "<15ms peer propagation",
    description: "Lightweight peer gossip broadcasts state vectors, current speed, and intent payloads directly to neighboring AMRs without cloud relays.",
    technicalDetails: [
      "Zero central broker: pure peer-to-peer unicast / multicast via rmw_zenoh",
      "Eliminates Wi-Fi multicast discovery storms endemic to legacy DDS setups",
      "Compact CDR binary payload (48 bytes) with CRC32 integrity check",
    ],
    packetTopic: "edgefleet/v2v/intent_broadcast",
    codeSnippet: {
      rawCode: `# 2. Direct Peer-to-Peer State Gossip (Zero Cloud Broker)
session.put("edgefleet/v2v/intent", ZenohPayload(
    node_id=self.id, position=(robot.x, robot.y),
    lease_req=True, seq_num=self.seq_num,
    signature=ed25519_sign(self.secret_key)
))`,
      lines: [
        [{ text: "# 2. Direct Peer-to-Peer State Gossip (Zero Cloud Broker)", type: "comment" }],
        [
          { text: "session.", type: "plain" },
          { text: "put", type: "fn" },
          { text: "(", type: "plain" },
          { text: '"edgefleet/v2v/intent"', type: "str" },
          { text: ", ", type: "plain" },
          { text: "ZenohPayload", type: "fn" },
          { text: "(", type: "plain" },
        ],
        [
          { text: "    node_id=self.id, position=(robot.x, robot.y),", type: "plain" },
        ],
        [
          { text: "    lease_req=", type: "plain" },
          { text: "True", type: "keyword" },
          { text: ", seq_num=self.seq_num,", type: "plain" },
        ],
        [
          { text: "    signature=", type: "plain" },
          { text: "ed25519_sign", type: "fn" },
          { text: "(self.secret_key)", type: "plain" },
        ],
        [{ text: "))", type: "plain" }],
      ],
    },
    mathData: {
      label: "Peer Wire Mesh State Vector:",
      displayFormula: (
        <span>
          &#120132;<sub>gossip</sub> = &lang; <em>ID</em><sub>node</sub>, <em>Pos</em><sub>t</sub>, <em>LeaseReq</em>, <em>SeqNum</em>, <em>Sign</em><sub>ed25519</sub> &rang;
        </span>
      ),
      variables: [
        { symbol: "ID_node", meaning: "Ed25519 cryptographically authenticated node identifier" },
        { symbol: "Pos_t", meaning: "Real-time space-time coordinate tuple (x, y, θ)" },
        { symbol: "LeaseReq", meaning: "Boolean corridor exclusivity intent arbitration flag" },
      ],
    },
  },
  {
    id: 3,
    title: "3. Space-Time Mutex Lease Arbitration",
    badge: "Expiring Short Lease",
    latency: "~20ms arbitration",
    description: "Peers negotiate spatial clearance windows at chokepoint Corridor C-14. Highest deterministic utility acquires an exclusive expiring lease.",
    technicalDetails: [
      "Deterministic scoring hierarchy: Safety Buffer > Task Urgency > Battery > Arrival",
      "Zero deadlock guarantee: trailing peer yields safely at designated staging line",
      "Expiring short lease prevents permanent corridor lockout if an agent faults",
    ],
    packetTopic: "edgefleet/corridor/c14/lease_grant",
    codeSnippet: {
      rawCode: `# 3. Corridor C-14 Mutex Arbitration Kernel (ISO 3691-4)
winner = max(peers, key=lambda p: (
    p.u_safety * 0.40 + p.u_urgency * 0.35 + p.u_battery * 0.25
))
if winner.id == self.id:
    grant_corridor_lease(winner, corridor="C-14", duration_ms=150)`,
      lines: [
        [{ text: "# 3. Corridor C-14 Mutex Arbitration Kernel (ISO 3691-4)", type: "comment" }],
        [
          { text: "winner = ", type: "plain" },
          { text: "max", type: "fn" },
          { text: "(peers, ", type: "plain" },
          { text: "key", type: "keyword" },
          { text: "=", type: "plain" },
          { text: "lambda", type: "keyword" },
          { text: " p: (", type: "plain" },
        ],
        [
          { text: "    p.u_safety * 0.40 + p.u_urgency * 0.35 + p.u_battery * 0.25", type: "plain" },
        ],
        [{ text: "))", type: "plain" }],
        [
          { text: "if", type: "keyword" },
          { text: " winner.id == self.id:\n    ", type: "plain" },
          { text: "grant_corridor_lease", type: "fn" },
          { text: "(winner, corridor=", type: "plain" },
          { text: '"C-14"', type: "str" },
          { text: ", duration_ms=150)", type: "plain" },
        ],
      ],
    },
    mathData: {
      label: "Deterministic Space-Time Decision Equation:",
      displayFormula: (
        <span>
          LeaseWinner = arg max<sub><em>i</em> &isin; Peers</sub> [ <em>U</em><sub>safety</sub>(<em>i</em>) + <em>U</em><sub>urgency</sub>(<em>i</em>) + <em>U</em><sub>battery</sub>(<em>i</em>) ]
        </span>
      ),
      variables: [
        { symbol: "U_safety(i)", meaning: "Distance to chokepoint hold line (weight: 0.40)" },
        { symbol: "U_urgency(i)", meaning: "Mission dispatch deadline priority SLA (weight: 0.35)" },
        { symbol: "U_battery(i)", meaning: "State of charge & thermal budget (weight: 0.25)" },
      ],
    },
  },
  {
    id: 4,
    title: "4. D* Lite Detour & Contract-Net Re-bidding",
    badge: "D* Lite & MRTA",
    latency: "~42ms graph repair",
    description: "When an aisle obstruction (such as Aisle B-07) is detected, the affected AMR calculates an immediate detour and auctions stranded tasks.",
    technicalDetails: [
      "D* Lite incremental graph repair around perimeter racks without global re-computation",
      "Contract-Net Protocol (CNP) task re-bidding among eligible idle peers",
      "Sub-150ms worst-case total replan and auction convergence on local LAN",
    ],
    packetTopic: "edgefleet/tasks/auction_bid",
    codeSnippet: {
      rawCode: `# 4. Incremental D* Lite Re-planning & CNP Task Auction
detour_path = dstar_lite.replan(blocked_edge="Aisle_B07")
if not detour_path.is_feasible():
    cnp_auction_stranded_tasks(winner_takes_all=False)`,
      lines: [
        [{ text: "# 4. Incremental D* Lite Re-planning & CNP Task Auction", type: "comment" }],
        [
          { text: "detour_path = dstar_lite.", type: "plain" },
          { text: "replan", type: "fn" },
          { text: "(blocked_edge=", type: "plain" },
          { text: '"Aisle_B07"', type: "str" },
          { text: ")", type: "plain" },
        ],
        [
          { text: "if not", type: "keyword" },
          { text: " detour_path.", type: "plain" },
          { text: "is_feasible", type: "fn" },
          { text: "():\n    ", type: "plain" },
          { text: "cnp_auction_stranded_tasks", type: "fn" },
          { text: "(winner_takes_all=", type: "plain" },
          { text: "False", type: "keyword" },
          { text: ")", type: "plain" },
        ],
      ],
    },
    mathData: {
      label: "Contract-Net Task Utility Objective Function:",
      displayFormula: (
        <span>
          <em>U</em>(<em>r</em>, <em>t</em>) = <em>w</em><sub>p</sub> &middot; <em>P</em>(<em>t</em>) &minus; <em>w</em><sub>d</sub> &middot; <em>D</em>(<em>r</em>, <em>t</em>) + <em>w</em><sub>b</sub> &middot; (<em>B</em><sub>r</sub> &minus; <em>B</em><sub>min</sub>)
        </span>
      ),
      variables: [
        { symbol: "P(t)", meaning: "Priority rating of pending pallet transport job" },
        { symbol: "D(r, t)", meaning: "Incremental perimeter detour graph distance (meters)" },
        { symbol: "B_r - B_min", meaning: "Remaining battery buffer above minimum return threshold" },
      ],
    },
  },
];

export function InteractiveProtocolFlow() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [viewMode, setViewMode] = useState<"code" | "math">("code");
  const [copied, setCopied] = useState(false);

  // Auto-step progression
  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoPlay]);

  const currentStep = steps[activeStepIndex];

  const handleSelectStep = (index: number) => {
    setActiveStepIndex(index);
    playChirp();
    if (index === 2) playLeaseAcquired();
  };

  const handleCopyCode = async () => {
    const textToCopy =
      viewMode === "code"
        ? currentStep.codeSnippet.rawCode
        : `${currentStep.mathData.label}\n${currentStep.mathData.variables.map((v) => `${v.symbol}: ${v.meaning}`).join("\n")}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      playClick();
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <section id="protocol-flow" className="content-section" style={{ paddingTop: 40, paddingBottom: 50 }}>
      {/* 21st.dev Section Header with Two-Tone Display Headline */}
      <div className="section-header" style={{ marginBottom: 28 }}>
        <div className="section-kicker">Autonomous Consensus Protocol (IEEE &amp; SIH 26123)</div>
        <h2 className="section-display-title">
          <span className="text-display-muted">4-Stage Peer Lifecycle. </span>
          <span className="text-display-emphasis">Sub-150ms Bounded Decisions.</span>
        </h2>
        <p className="section-description">
          Follow the deterministic peer-to-peer coordination cycle from physical LiDAR obstacle perception to
          space-time corridor leases and Contract-Net task re-bidding. All operations execute locally with p95 &lt; 150ms
          decision latency.
        </p>
      </div>

      {/* Stepper Tabs Bar */}
      <div className="protocol-stepper-wrap">
        <div className="protocol-stepper">
          {steps.map((step, idx) => {
            const isActive = idx === activeStepIndex;
            const isCompleted = idx < activeStepIndex;

            return (
              <button
                key={step.id}
                type="button"
                className={`protocol-step-btn ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                onClick={() => handleSelectStep(idx)}
              >
                <div className="step-num-badge">
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="step-meta">
                  <div className="step-title-short">{step.title.split(". ")[1]}</div>
                  <div className="step-latency-tag">{step.latency}</div>
                </div>
                {/* Progress bar inside active step */}
                {isActive && autoPlay && <div className="step-progress-bar" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Detailed Showcase (Card Hairline) */}
      <SpotlightCard className="protocol-showcase-card card-hairline" style={{ marginTop: 20 }}>
        <div className="protocol-showcase-grid">
          {/* Left Column: Conceptual & Operational Description */}
          <div className="protocol-left-col">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-active">{currentStep.badge}</span>
                <span className="mono-tag" style={{ color: "var(--solar-terracotta)" }}>
                  Benchmark Timing: {currentStep.latency}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 11.5, padding: "4px 10px", display: "inline-flex", alignItems: "center", gap: 6 }}
                onClick={() => {
                  setAutoPlay(!autoPlay);
                  playClick();
                }}
              >
                {autoPlay ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Auto-Step</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    <span>Play Auto-Step</span>
                  </>
                )}
              </button>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
              {currentStep.title}
            </h3>

            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              {currentStep.description}
            </p>

            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 10 }}>
              Engineering Execution Highlights:
            </div>
            <ul className="protocol-bullet-list">
              {currentStep.technicalDetails.map((detail, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      backgroundColor: "var(--bg-elevated)",
                      border: "1px solid var(--border-tactical)",
                      color: "var(--solar-terracotta)",
                      flexShrink: 0,
                      marginTop: 2,
                    }}
                  >
                    <Check className="w-3 h-3" />
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Code, Topic & Mathematical Formulation */}
          <div className="protocol-right-col">
            <div className="protocol-code-box card-hairline">
              {/* Terminal Window Header */}
              <div className="protocol-code-header">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginLeft: 4 }}>
                    {currentStep.packetTopic}
                  </span>
                </div>
                <span className="mono-tag" style={{ fontSize: 10 }}>SIH 26123 KERNEL</span>
              </div>

              {/* View Switcher: Code Kernel vs Math Formulation */}
              <div className="protocol-view-nav">
                <div className="protocol-view-tabs" role="tablist">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === "code"}
                    className={`protocol-tab-btn ${viewMode === "code" ? "active" : ""}`}
                    onClick={() => {
                      setViewMode("code");
                      playClick();
                    }}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Python / ROS 2 Code</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={viewMode === "math"}
                    className={`protocol-tab-btn ${viewMode === "math" ? "active" : ""}`}
                    onClick={() => {
                      setViewMode("math");
                      playClick();
                    }}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Math Formulation</span>
                  </button>
                </div>

                <button
                  type="button"
                  className="protocol-copy-btn"
                  onClick={handleCopyCode}
                  title="Copy snippet to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" style={{ color: "var(--solar-terracotta)" }} />
                      <span style={{ color: "var(--solar-terracotta)" }}>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dynamic Content View */}
              {viewMode === "code" ? (
                /* Syntax-Highlighted Real Code Editor Block */
                <div className="code-editor-block" role="region" aria-label="Edge Code Kernel">
                  {currentStep.codeSnippet.lines.map((lineTokens, lineIdx) => (
                    <div key={lineIdx} className="code-line-row">
                      <span className="code-line-num">{lineIdx + 1}</span>
                      <span className="code-line-code">
                        {lineTokens.map((tok, tokIdx) => (
                          <span
                            key={tokIdx}
                            className={tok.type ? `token-${tok.type}` : undefined}
                          >
                            {tok.text}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                /* Cleanly Formatted Mathematical Formulation */
                <div className="math-clean-display" role="region" aria-label="Mathematical Formulation">
                  <div className="math-label" style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
                    {currentStep.mathData.label}
                  </div>
                  <div className="math-main-equation">
                    {currentStep.mathData.displayFormula}
                  </div>
                  <div className="math-var-list">
                    {currentStep.mathData.variables.map((v, i) => (
                      <div key={i} className="math-var-item">
                        <span className="math-var-symbol">{v.symbol}</span>
                        <span>{v.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Real-time Hardware Telemetry Bar */}
              <div className="protocol-hw-telemetry">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="hw-label">Target Hardware:</span>
                  <span className="hw-val" style={{ fontWeight: 600, color: "var(--text-primary)" }}>Raspberry Pi 5 / Jetson Orin</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="hw-label">RAM Footprint:</span>
                  <span className="hw-val" style={{ fontWeight: 600, color: "var(--text-primary)" }}>&lt; 120 MB (SWaP-C)</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="hw-label">Peer Transport:</span>
                  <span className="hw-val" style={{ fontWeight: 600, color: "var(--text-primary)" }}>rmw_zenoh (48-byte CDR)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
