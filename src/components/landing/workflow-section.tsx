"use client";

import { useState } from "react";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { playClick, playChirp } from "@/lib/sound-effects";
import {
  AlertOctagon,
  Eye,
  Radio,
  Lock,
  GitFork,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface WorkflowStep {
  id: number;
  phase: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
  triggerEvent: string;
  edgeAction: string;
  outcome: string;
  color: string;
  techPayload: string;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    phase: "PHASE 01",
    title: "Problem: Chokepoint & Obstacle",
    icon: <AlertOctagon className="w-5 h-5 text-amber-500" />,
    subtitle: "Aisle B-07 Blocked & Single-Lane Corridor C-14",
    triggerEvent: "Human worker drops pallet in Aisle B-07; AMR-01 and AMR-02 approach narrow Corridor C-14 simultaneously.",
    edgeAction: "No central server to report to; robots detect physical impediment locally via onboard lidar sensors.",
    outcome: "Standard central fleet servers would halt the entire fleet with latency timeouts; Edge AI initiates local arbitration.",
    color: "#F59E0B",
    techPayload: "EVENT: OBSTACLE_DETECTED [Pos: (500, 270)] & CORRIDOR_CHOKE_PROXIMITY",
  },
  {
    id: 2,
    phase: "PHASE 02",
    title: "Local Intelligence: Edge Perception",
    icon: <Eye className="w-5 h-5 text-blue-500" />,
    subtitle: "20Hz 3D LiDAR Point Cloud Clustering",
    triggerEvent: "Onboard sensors detect a static or dynamic obstacle on the robot's route.",
    edgeAction: "The robot marks the aisle impassable in its own local map (reference design: ISO 3691-4-style clearance zones).",
    outcome: "AMR-03 verifies corridor Aisle B-07 is completely blocked and initiates local re-planning sub-routine.",
    color: "#2563EB",
    techPayload: "LOCAL_MAP_UPDATE: illustrative packet | aisle marked impassable",
  },
  {
    id: 3,
    phase: "PHASE 03",
    title: "Peer Coordination: V2V Gossip Mesh",
    icon: <Radio className="w-5 h-5 text-indigo-500" />,
    subtitle: "Peer-to-Peer Broadcast on the Mesh",
    triggerEvent: "AMRs broadcast state vectors, current velocity, and intent payloads to peer robots within radio range.",
    edgeAction: "The alert is broadcast to every peer on the mesh (in this simulation an in-process pub/sub bus; a network transport such as Zenoh/DDS is the intended swap-in).",
    outcome: "All 3 AMRs learn of the blockage from the mesh with no central server or cloud relay.",
    color: "#6366F1",
    techPayload: "OBSTACLE_ALERT: illustrative packet | broadcast to all peers on the mesh",
  },
  {
    id: 4,
    phase: "PHASE 04",
    title: "Conflict Resolution: Mutex Leases",
    icon: <Lock className="w-5 h-5 text-emerald-500" />,
    subtitle: "Decentralized Space-Time Corridor Locking",
    triggerEvent: "AMR-01 and AMR-02 evaluate arrival time windows at single-lane Corridor C-14.",
    edgeAction: "Space-time reservation algorithm executes: AMR-01 arrives at T+1.2s, AMR-02 arrives at T+1.8s.",
    outcome: "AMR-01 claims exclusive corridor lease; AMR-02 autonomously decelerates and stages at Waypoint W-14.2.",
    color: "#10B981",
    techPayload: "LEASE_ACQUIRED: Node 'AMR-01' | Chokepoint: C-14 | Window: [T+1.2s, T+3.8s] | Deadlock: 0",
  },
  {
    id: 5,
    phase: "PHASE 05",
    title: "Dynamic Routing: A* Detour",
    icon: <GitFork className="w-5 h-5 text-purple-500" />,
    subtitle: "Real-Time Graph Repair & Perimeter Detour",
    triggerEvent: "AMR-03 must fulfill its pallet delivery despite blocked highway Aisle B-07.",
    edgeAction: "Each robot re-runs A* on its own graph and picks the alternative route around the perimeter racks.",
    outcome: "AMR-03 transitions smoothly into detour path without stopping or waiting for operator intervention.",
    color: "#8B5CF6",
    techPayload: "ASTAR_REPLAN: illustrative packet | route re-planned around the blocked aisle",
  },
  {
    id: 6,
    phase: "PHASE 06",
    title: "Fleet Outcome: Zero Interruption",
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    subtitle: "Zero SPOF & Continuous Warehouse Throughput",
    triggerEvent: "Corridor C-14 cleared; AMR-02 claims next lease; AMR-03 reaches delivery dock on detour.",
    edgeAction: "Autonomous leases release automatically upon corridor exit beacon detection; mesh quorum remains 100% nominal.",
    outcome: "Measured result: see the live benchmark below (decentralized vs stop-and-wait). 0 collisions; no human dispatch needed.",
    color: "#059669",
    techPayload: "METRICS: Collisions: 0 | P99 Latency: 42ms | Central Cloud Uptime Req: 0.0%",
  },
];

export function WorkflowSection() {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = WORKFLOW_STEPS[activeStepIndex];

  return (
    <section id="workflow" className="content-section" style={{ paddingTop: 60, paddingBottom: 60 }}>
      {/* Section Header */}
      <div className="section-header">
        <div className="section-kicker">Autonomous Operational Lifecycle</div>
        <h2 className="section-title">The 6-Phase Decentralized Coordination Workflow</h2>
        <p className="section-description">
          Step-by-step technical breakdown of how EdgeFleet handles unexpected aisle obstructions, single-lane corridor
          contention, and dynamic path rerouting directly on AMR edge microcomputers.
        </p>
      </div>

      {/* 6-Phase Linear Progression Rail */}
      <div
        className="workflow-rail"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 10,
          marginBottom: 24,
          overflowX: "auto",
          paddingBottom: 8,
        }}
      >
        {WORKFLOW_STEPS.map((step, idx) => {
          const isSelected = idx === activeStepIndex;
          const isPast = idx < activeStepIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => {
                playClick();
                setActiveStepIndex(idx);
              }}
              className={`workflow-rail-btn ${isSelected ? "active" : ""} ${isPast ? "past" : ""}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "10px 12px",
                borderRadius: 8,
                background: isSelected ? "var(--bg-elevated)" : "var(--bg-surface)",
                border: `1px solid ${isSelected ? "var(--status-active)" : "var(--border-subtle)"}`,
                cursor: "pointer",
                textAlign: "left",
                minWidth: 140,
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "var(--font-mono)",
                    color: isSelected ? "var(--status-active)" : "var(--text-muted)",
                  }}
                >
                  {step.phase}
                </span>
                {step.icon}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  lineHeight: 1.25,
                }}
              >
                {step.title.split(": ")[1]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Phase Detailed Showcase (Spotlight Card) */}
      <SpotlightCard className="workflow-detail-card" style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }} className="workflow-grid-responsive">
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span className="mono-tag" style={{ fontWeight: 700, padding: "3px 8px" }}>
                {activeStep.phase} / 06
              </span>
              <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                &middot; {activeStep.subtitle}
              </span>
            </div>

            <h3 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
              {activeStep.title}
            </h3>

            {/* 3 Structured Storytelling Columns */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginTop: 8 }}>
              {/* Trigger Event */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 6 }}>
                  1. Trigger Event
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {activeStep.triggerEvent}
                </div>
              </div>

              {/* Edge AI Action */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--status-active)", marginBottom: 6 }}>
                  2. Decentralized Edge Action
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.5, fontWeight: 500 }}>
                  {activeStep.edgeAction}
                </div>
              </div>

              {/* Verified Outcome */}
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--status-nominal)", marginBottom: 6 }}>
                  3. Verified Fleet Outcome
                </div>
                <div style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  {activeStep.outcome}
                </div>
              </div>
            </div>

            {/* Real-time Technical Packet Payload Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 6,
                background: "var(--bg-base)",
                border: "1px solid var(--border-tactical)",
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--text-muted)",
                flexWrap: "wrap",
                gap: 8,
                marginTop: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "var(--status-nominal)" }}>●</span>
                <span style={{ color: "var(--text-primary)" }}>{activeStep.techPayload}</span>
              </div>
              <span>Illustrative packet, not a measurement</span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </section>
  );
}
