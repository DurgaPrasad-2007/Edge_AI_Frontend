"use client";

import { useState, useEffect } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { playClick, playChirp, playLeaseAcquired } from "@/lib/sound-effects";
import {
  Eye,
  Cpu,
  Radio,
  Lock,
  Play,
  Pause,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface Step {
  id: number;
  title: string;
  badge: string;
  latency: string;
  description: string;
  technicalDetails: string[];
  mathSnippet: string;
  packetTopic: string;
}

const steps: Step[] = [
  {
    id: 1,
    title: "1. 3D Spatial Lidar Perception",
    badge: "20Hz Scan Cycle",
    latency: "12ms",
    description: "Onboard Solid-State LiDAR sweeps the aisle, detecting pallet overhangs or stray warehouse workers in real-time.",
    technicalDetails: [
      "Voxel grid spatial clustering at 0.05m resolution",
      "Dynamic obstacle velocity tracking via Kalman Filter",
      "ISO 3691-4 Cat-3 fail-safe boundary evaluation",
    ],
    mathSnippet: "C_{obs} = \\{ p \\in \\mathbb{R}^3 \\mid \\|p - p_{amr}\\|_2 \\le R_{safety} + v \\cdot t_{brake} \\}",
    packetTopic: "sensor_msgs/msg/LaserScan",
  },
  {
    id: 2,
    title: "2. D* Lite Local Re-planning",
    badge: "Microcomputer Compute",
    latency: "38ms",
    description: "The onboard Jetson Orin re-plans local waypoints around the obstruction without querying central cloud servers.",
    technicalDetails: [
      "Incremental graph repair avoiding full re-calculation",
      "Dynamic cost-space expansion along aisle boundaries",
      "Sub-84ms bounded worst-case convergence guarantee",
    ],
    mathSnippet: "rhs(s) = \\min_{s' \\in Succ(s)} \\left( c(s, s') + g(s') \\right)",
    packetTopic: "nav_msgs/msg/Path",
  },
  {
    id: 3,
    title: "3. Zenoh V2V Peer Gossip Mesh",
    badge: "Ad-Hoc 5GHz Wi-Fi",
    latency: "6ms",
    description: "The updated trajectory and corridor reservations are broadcasted directly to neighboring AMRs over a peer mesh.",
    technicalDetails: [
      "Zero central broker: pure peer-to-peer unicast / multicast",
      "Zenoh scout discovery protocol for ad-hoc node joins",
      "Compact CDR binary payload (48 bytes) with CRC32 check",
    ],
    mathSnippet: "\\mathbb{M}_{gossip} = \\langle ID_{node}, Pos_{t}, LeaseReq, SeqNum, Sign_{ed25519} \\rangle",
    packetTopic: "edgefleet/v2v/intent_broadcast",
  },
  {
    id: 4,
    title: "4. Space-Time Mutex Resolution",
    badge: "Zero-SPOF Consensus",
    latency: "18ms",
    description: "The fleet evaluates spatial clearance windows. The leading AMR acquires the exclusive lease for Corridor C-14.",
    technicalDetails: [
      "Deterministic Lamport timestamp ordering with tie-breaking",
      "Zero possibility of circular wait or multi-robot gridlock",
      "Automatic fail-safe lease expiration on node disconnect",
    ],
    mathSnippet: "LeaseHolder = \\arg\\min_{i \\in Peers} \\left( t_{arrival}(i), ID_i \\right)",
    packetTopic: "edgefleet/corridor/c14/lease_grant",
  },
];

export function InteractiveProtocolFlow() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

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
    setAutoPlay(false);
    setActiveStepIndex(index);
    playChirp();
    if (index === 3) playLeaseAcquired();
  };

  return (
    <section id="protocol-flow" className="content-section" style={{ paddingTop: 40, paddingBottom: 60 }}>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-kicker">Autonomous Consensus Engine</div>
        <h2 className="section-title">The 4-Stage Decentralized Control Loop</h2>
        <p className="section-description">
          Follow the exact sub-84ms cycle from physical lidar detection to peer-to-peer space-time lease acquisition.
          Click any step to inspect its algorithmic formulation and micro-protocol message.
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

        {/* Auto-Play Toggle */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: 12, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6 }}
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
      </div>

      {/* Active Step Detailed Showcase (Spotlight Card) */}
      <SpotlightCard className="protocol-showcase-card" style={{ marginTop: 20 }}>
        <div className="protocol-showcase-grid">
          {/* Left Column: Conceptual & Operational Description */}
          <div className="protocol-left-col">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <span className="badge badge-active">{currentStep.badge}</span>
              <span className="mono-tag" style={{ color: "var(--status-active)" }}>
                P95 Time: {currentStep.latency}
              </span>
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: "var(--text-primary)" }}>
              {currentStep.title}
            </h3>

            <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>
              {currentStep.description}
            </p>

            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>
              Engineering Execution Highlights:
            </div>
            <ul className="protocol-bullet-list">
              {currentStep.technicalDetails.map((detail, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                  <span className="bullet-check text-emerald-600 font-bold">&check;</span>
                  <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{detail}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Code, Topic & Mathematical Formulation */}
          <div className="protocol-right-col">
            <div className="protocol-code-box">
              <div className="protocol-code-header">
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className="terminal-dot red" />
                  <div className="terminal-dot yellow" />
                  <div className="terminal-dot green" />
                  <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
                    {currentStep.packetTopic}
                  </span>
                </div>
                <span className="mono-tag" style={{ fontSize: 10 }}>SIH 26123 MATH</span>
              </div>

              {/* Math Display */}
              <div className="protocol-math-container">
                <div className="math-label">Deterministic Decision Equation:</div>
                <div className="math-formula-box">
                  <code>{currentStep.mathSnippet}</code>
                </div>
              </div>

              {/* Real-time Hardware Telemetry Bar */}
              <div className="protocol-hw-telemetry">
                <div>
                  <span className="hw-label">Target Hardware:</span>
                  <span className="hw-val">Jetson Orin Nano / RPi5</span>
                </div>
                <div>
                  <span className="hw-label">RAM Footprint:</span>
                  <span className="hw-val">42 MB (Ultra-light)</span>
                </div>
                <div>
                  <span className="hw-label">Bus Over-Wire:</span>
                  <span className="hw-val">&lt; 1.2 KB/s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
