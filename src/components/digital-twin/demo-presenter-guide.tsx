"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { playClick, playChirp, playWarning, playLeaseAcquired } from "@/lib/sound-effects";
import type { RobotState, RobotId } from "@/lib/fleet-contract";
import { useFleetSocket } from "@/lib/use-fleet-socket";

export type DemoScenario = "mutex" | "obstacle" | "auction" | "dropout" | "battery";

interface DemoPresenterGuideProps {
  isRunning: boolean;
  onToggleRunning: () => void;
  onReset: () => void;
  onInjectBlockage: () => void;
  aisleBlocked: boolean;
  reservation: RobotId | null;
  robots: RobotState[];
  onTriggerScenario: (scenario: DemoScenario) => void;
}

const SCENARIOS: Array<{ id: DemoScenario; icon: string; title: string; blurb: string; sound: () => void }> = [
  { id: "mutex", icon: "⚡", title: "Head-on Chokepoint Mutex", blurb: "Two AMRs meet at C-14; highest utility leases corridor, loser yields at hold line.", sound: playLeaseAcquired },
  { id: "obstacle", icon: "🚧", title: "Dynamic Obstacle A* Replan", blurb: "Block Aisle B-07; en-route AMR detects obstruction and detours around the perimeter.", sound: playWarning },
  { id: "auction", icon: "🤝", title: "Contract-Net Task Auction", blurb: "Broadcast mission; AMRs evaluate bids locally; highest score wins the contract.", sound: playChirp },
  { id: "dropout", icon: "⚠️", title: "Agent Dropout & Lease Expiry", blurb: "Simulate radio blackout; bounded lease expires in 4.8s with zero corridor deadlock.", sound: playWarning },
  { id: "battery", icon: "🔋", title: "Low Battery & Auto-Charge", blurb: "AMR battery drops below 30%; robot halts tasks and self-dispatches to Charge Bay.", sound: playChirp },
];

export function DemoPresenterGuide({ aisleBlocked, reservation, robots, onTriggerScenario }: DemoPresenterGuideProps) {
  const { world, fleetState, kpis } = useFleetSocket();
  const [activeScenario, setActiveScenario] = useState<DemoScenario>("mutex");
  const [showCheatSheet, setShowCheatSheet] = useState(false);

  const zoneId = world?.mutex_zones[0] ?? "the mutex zone";
  const yielding = robots.filter((r) => r.status === "Yielding");
  const rerouting = robots.filter((r) => r.status === "Rerouting");
  const charging = robots.filter((r) => r.status === "Charging" || r.leg === "to_charge");
  const failed = robots.filter((r) => r.status === "Blocked" && r.task.includes("offline"));
  const bids = (fleetState?.p2p ?? []).filter((m) => m.type === "TASK_BID");
  const period = world?.config.control_period_s;

  // Technical prompter narration derived dynamically from current screen state
  let narration: string;
  if (activeScenario === "mutex") {
    narration = reservation
      ? `${reservation} holds the exclusive micro-lease on ${zoneId}.${yielding.length ? ` ${yielding.map((r) => r.id).join(", ")} yielded at the hold line.` : " Both AMRs arbitrated right-of-way via deterministic utility ranking."}`
      : `Corridor ${zoneId} is free. Trigger to dispatch opposing AMRs: contenders are ranked by Priority + 0.2 × (100 − Battery), with lower ID breaking ties.`;
  } else if (activeScenario === "obstacle") {
    narration = aisleBlocked
      ? `Aisle ${fleetState?.blocked_nodes.join(", ") ?? "B-07"} is blocked. ${rerouting.length ? `${rerouting.map((r) => r.id).join(", ")} replanned with A* and is detouring via the southern perimeter.` : "En-route AMRs invalidated the edge and detoured around the obstacle without global recomputation."}`
      : "Trigger to block Aisle B-07 mid-transit. The AMR onboard planner detects the hazard and navigates the perimeter detour.";
  } else if (activeScenario === "auction") {
    narration = bids.length
      ? `${bids.length} Contract-Net bids calculated across the fleet. Winner scored by: (Capacity Margin × 0.05) + (Battery × 0.40) − (A* Distance × 0.08) + (Priority × 0.25). Latest winner: ${bids[0].sender}`
      : "Trigger to broadcast a cargo task. AMRs calculate decentralized bids locally without central dispatch.";
  } else if (activeScenario === "dropout") {
    narration = failed.length
      ? `Simulated radio failure on ${failed.map((r) => r.id).join(", ")}. Notice that its corridor lease was immediately revoked and any active lease expires within 4.8s, guaranteeing zero permanent corridor deadlock.`
      : "Trigger to simulate sudden radio blackout / agent dropout. Demonstrates bounded lease expiry and zero deadlock on hardware fault.";
  } else {
    narration = charging.length
      ? `${charging.map((r) => r.id).join(", ")} battery dropped below the 30% threshold. It refused new task assignments and autonomously self-dispatched to the green CHARGE BAY, charging at +1.5%/tick.`
      : "Trigger to simulate battery depletion. Shows the 20% safety reserve constraint and autonomous return-to-base opportunity charging.";
  }

  const facts = [
    ["Simulation tick", `${fleetState?.tick ?? 0}${period ? ` (${Math.round(period * 1000)} ms each)` : ""}`],
    ["Peer packets exchanged", String(fleetState?.messages ?? 0)],
    ["Missions completed", String(kpis.completedTotal)],
    ["Proximity violations", String(kpis.collisionCount)],
    ["Corridor leases active", String(kpis.activeLeases)],
  ];

  return (
    <div className="demo-presenter-box" style={{ marginBottom: 16 }}>
      <div className="glass-panel" style={{ borderRadius: 8, padding: "14px 16px", border: "1px solid var(--border-tactical)", background: "var(--bg-elevated)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="badge badge-active" style={{ fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>SIH 26123 DEMO CONTROLLER</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>One-Click Scenarios (run against the live backend)</span>
          </div>
          <button
            type="button"
            onClick={() => {
              playClick();
              setShowCheatSheet(!showCheatSheet);
            }}
            className="btn btn-secondary"
            style={{ fontSize: 11.5, padding: "4px 10px", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Info className="w-3.5 h-3.5 text-blue-500" />
            <span>{showCheatSheet ? "Hide Live Numbers" : "Show Live Numbers"}</span>
            {showCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10, marginBottom: 14 }}>
          {SCENARIOS.map((sc, i) => {
            const isSelected = activeScenario === sc.id;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => {
                  sc.sound();
                  setActiveScenario(sc.id);
                  onTriggerScenario(sc.id);
                }}
                className={`demo-scenario-card ${isSelected ? "active" : ""}`}
              >
                <div className="demo-scenario-card-header">
                  <span className="demo-scenario-card-chip">
                    <span>{sc.icon}</span>
                    <span>SCENARIO {i + 1}</span>
                  </span>
                  {isSelected && (
                    <div className="demo-scenario-active-indicator">
                      <span className="demo-scenario-active-dot" />
                      <span>ACTIVE</span>
                    </div>
                  )}
                </div>
                <strong className="demo-scenario-card-title">
                  {sc.title}
                </strong>
                <span className="demo-scenario-card-blurb">
                  {sc.blurb}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-tactical)", borderRadius: 8, padding: "12px 16px", borderLeft: "4px solid var(--border-focus)", boxShadow: "var(--shadow-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "var(--status-active)", background: "var(--status-active-tint)", padding: "2px 8px", borderRadius: 4, fontFamily: "var(--font-mono)", letterSpacing: "0.04em", border: "1px solid rgba(194, 84, 26, 0.25)" }}>
              WHAT IS HAPPENING RIGHT NOW
            </span>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: reservation ? "var(--accent-emerald)" : "var(--text-muted)", fontWeight: reservation ? 600 : 400 }}>
              {reservation ? `Lease active [${reservation}]` : "No active lease"}
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.55, margin: 0, fontWeight: 500 }}>{narration}</p>
        </div>

        {showCheatSheet && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-subtle)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12, fontSize: 12 }}>
            <div style={{ padding: 10, background: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>How collisions are avoided</div>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.4 }}>
                A robot must reserve its next two waypoints, all-or-nothing, before it moves; single-lane zones additionally need a lease. A robot that cannot reserve waits at its current node, and mutual waits are broken by the lowest-ranked robot stepping aside.
              </div>
            </div>
            <div style={{ padding: 10, background: "var(--bg-surface)", borderRadius: 6, border: "1px solid var(--border-subtle)" }}>
              <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Live numbers (from the backend)</div>
              <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
                {facts.map(([label, value]) => (
                  <div key={label}>&bull; {label}: <strong>{value}</strong></div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
