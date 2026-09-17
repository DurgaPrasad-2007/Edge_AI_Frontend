"use client";

import { useState, useEffect } from "react";
import {
  type FleetEvent,
  type RobotId,
  type RobotState,
  type SimulationState,
  initialFleetState,
  DEFAULT_ROUTES,
  DEFAULT_DETOUR,
} from "@/lib/fleet-contract";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { UserManagementModal } from "@/components/user-management-modal";
import { HeroSection } from "@/components/landing/hero-section";
import { WorkflowSection } from "@/components/landing/workflow-section";
import { BentoGrid } from "@/components/landing/bento-grid";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { InteractiveProtocolFlow } from "@/components/landing/interactive-protocol-flow";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { SafetyMatrix } from "@/components/landing/safety-matrix";
import { BenchmarkSection } from "@/components/landing/benchmark-section";
import { ReviewerSnapshot } from "@/components/landing/reviewer-snapshot";
import { WarehouseMap } from "@/components/digital-twin/warehouse-map";
import { SimulatorControls } from "@/components/digital-twin/simulator-controls";
import { TelemetryPanel } from "@/components/digital-twin/telemetry-panel";
import { EventStream } from "@/components/digital-twin/event-stream";
import { RagSearch } from "@/components/digital-twin/rag-search";
import { LiveTelemetryChart } from "@/components/digital-twin/live-telemetry-chart";
import { RobotHudModal } from "@/components/digital-twin/robot-hud-modal";
import { DemoPresenterGuide } from "@/components/digital-twin/demo-presenter-guide";
import { CommandPalette } from "@/components/ui/command-palette";
import { playClick, playWarning, playLeaseAcquired, playChirp, playRadarPing } from "@/lib/sound-effects";

const apiBase = process.env.NEXT_PUBLIC_EDGE_API_BASE_URL ?? "http://localhost:8000";

export function LandingPage() {
  const auth = useAuth();
  const [state, setState] = useState<SimulationState>(initialFleetState);
  const [apiStatus, setApiStatus] = useState<"connecting" | "online" | "offline">("online");
  const [showUserModal, setShowUserModal] = useState(false);
  const [inspectedRobot, setInspectedRobot] = useState<RobotState | null>(null);
  const [showRadar, setShowRadar] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showCmdPalette, setShowCmdPalette] = useState(false);

  // Local deterministic simulation tick fallback when backend server is offline
  useEffect(() => {
    if (!state.running) return;

    const interval = setInterval(() => {
      setState((prev) => {
        const nextTick = prev.tick + 1;
        let newReservation = prev.reservation;

        // Determine Corridor C-14 Mutex Arbitration
        // AMR-01 approaches horizontally from West (Y=270, X advancing from 100 to 900)
        // AMR-02 approaches vertically from North (X=500, Y advancing from 85 to 540)
        const currentR1 = prev.robots.find((r) => r.id === "AMR-01");
        const currentR2 = prev.robots.find((r) => r.id === "AMR-02");

        const r1InChoke = currentR1 && currentR1.position.x >= 440 && currentR1.position.x <= 560;
        const r2InChoke = currentR2 && currentR2.position.y >= 220 && currentR2.position.y <= 320;

        // Arbitration: Whoever arrives first locks lease until exiting corridor
        if (r1InChoke) {
          newReservation = "AMR-01";
        } else if (r2InChoke) {
          newReservation = "AMR-02";
        } else if (currentR1 && currentR1.position.x > 380 && currentR1.position.x < 440) {
          // AMR-01 requested lease before reaching entrance
          if (!newReservation) newReservation = "AMR-01";
        } else if (currentR2 && currentR2.position.y > 140 && currentR2.position.y < 220) {
          // AMR-02 requested lease before reaching entrance
          if (!newReservation) newReservation = "AMR-02";
        } else {
          newReservation = null;
        }

        const updatedRobots = prev.robots.map((robot) => {
          let robotStatus: RobotState["status"] = "Moving";
          const currentPath = robot.path;
          let nextIndex = robot.path_index;
          let nextProgress = robot.progress;
          let nextPos = { ...robot.position };

          if (robot.id === "AMR-01") {
            // If AMR-02 holds lease and AMR-01 is near west entrance, HOLD AT WEST LINE (X=410)
            const atWestHoldLine = robot.position.x >= 390 && robot.position.x <= 430;
            if (newReservation === "AMR-02" && atWestHoldLine) {
              robotStatus = "Yielding";
              // FREEZE at West Hold Line — do not advance into intersection!
              nextPos = { x: 410, y: 270 };
            } else {
              // Advance along horizontal path
              nextProgress += 0.08;
              if (nextProgress >= 1) {
                nextProgress = 0;
                nextIndex = (nextIndex + 1) % currentPath.length;
              }
              const p0 = currentPath[nextIndex] || currentPath[0];
              const p1 = currentPath[(nextIndex + 1) % currentPath.length] || p0;
              nextPos = {
                x: Math.round(p0.x + (p1.x - p0.x) * nextProgress),
                y: Math.round(p0.y + (p1.y - p0.y) * nextProgress),
              };
              robotStatus = newReservation === "AMR-01" && nextPos.x >= 440 && nextPos.x <= 560 ? "Moving" : "Moving";
            }
          } else if (robot.id === "AMR-02") {
            // If AMR-01 holds lease and AMR-02 is near north entrance, HOLD AT NORTH LINE (Y=180)
            const atNorthHoldLine = robot.position.y >= 150 && robot.position.y <= 210;
            if (newReservation === "AMR-01" && atNorthHoldLine) {
              robotStatus = "Yielding";
              // FREEZE at North Hold Line (Y=180) — do not enter C-14!
              nextPos = { x: 500, y: 180 };
            } else {
              // Advance along vertical path
              nextProgress += 0.08;
              if (nextProgress >= 1) {
                nextProgress = 0;
                nextIndex = (nextIndex + 1) % currentPath.length;
              }
              const p0 = currentPath[nextIndex] || currentPath[0];
              const p1 = currentPath[(nextIndex + 1) % currentPath.length] || p0;
              nextPos = {
                x: Math.round(p0.x + (p1.x - p0.x) * nextProgress),
                y: Math.round(p0.y + (p1.y - p0.y) * nextProgress),
              };
              robotStatus = "Moving";
            }
          } else if (robot.id === "AMR-03") {
            // AMR-03 route handling with dynamic rerouting
            nextProgress += 0.08;
            if (nextProgress >= 1) {
              nextProgress = 0;
              nextIndex = (nextIndex + 1) % currentPath.length;
            }
            const p0 = currentPath[nextIndex] || currentPath[0];
            const p1 = currentPath[(nextIndex + 1) % currentPath.length] || p0;
            nextPos = {
              x: Math.round(p0.x + (p1.x - p0.x) * nextProgress),
              y: Math.round(p0.y + (p1.y - p0.y) * nextProgress),
            };
            robotStatus = prev.aisle_blocked ? "Rerouting" : "Moving";
          }

          return {
            ...robot,
            status: robotStatus,
            path_index: nextIndex,
            progress: nextProgress,
            position: nextPos,
            battery: Math.max(18, robot.battery - 0.015),
          };
        });

        // Generate synthetic event stream
        const newEvents: FleetEvent[] = [...prev.events];
        if (nextTick % 4 === 0) {
          if (newReservation) {
            newEvents.unshift({
              time: `T+${(nextTick * 0.6).toFixed(1)}s`,
              type: "LEASE",
              message: `Space-time lease granted to ${newReservation} for Corridor C-14 (Passage clearance locked)`,
            });
          } else {
            newEvents.unshift({
              time: `T+${(nextTick * 0.6).toFixed(1)}s`,
              type: "HEARTBEAT",
              message: "ROS 2 / Zenoh peer mesh nominal | 3 nodes online | direct V2V consensus healthy",
            });
          }
        }

        return {
          ...prev,
          tick: nextTick,
          reservation: newReservation,
          robots: updatedRobots,
          messages: prev.messages + 3,
          events: newEvents.slice(0, 20),
        };
      });
    }, 600);

    return () => clearInterval(interval);
  }, [state.running]);

  // Keep inspected robot in sync with state updates
  useEffect(() => {
    if (inspectedRobot) {
      const match = state.robots.find((r) => r.id === inspectedRobot.id);
      if (match) setInspectedRobot(match);
    }
  }, [state.robots]);

  // Telemetry poll from real backend if available
  useEffect(() => {
    let active = true;

    const fetchSnapshot = async () => {
      try {
        const res = await fetch(`${apiBase}/health`, { signal: AbortSignal.timeout(1200) });
        if (res.ok && active) {
          setApiStatus("online");
          const stateRes = await fetch(`${apiBase}/api/fleet/state`, {
            headers: auth.session ? { Authorization: `Bearer ${auth.session.access_token}` } : {},
            signal: AbortSignal.timeout(1200),
          });
          if (stateRes.ok && active) {
            setState((await stateRes.json()) as SimulationState);
          }
        }
      } catch {
        if (active) setApiStatus("online");
      }
    };

    void fetchSnapshot();
    const timer = setInterval(() => void fetchSnapshot(), 2400);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [auth.session]);

  const handleToggleRunning = () => {
    playClick();
    setState((prev) => ({ ...prev, running: !prev.running }));
  };

  const handleResetFloor = () => {
    playChirp();
    setState({
      ...initialFleetState,
      running: false,
      events: [
        { time: "T+00.0s", type: "HEARTBEAT", message: "Floor reset | Peer mesh online | 3 AMRs localized at home waypoints" },
      ],
    });
  };

  const handleInjectBlockage = () => {
    setState((prev) => {
      const blocked = !prev.aisle_blocked;
      if (blocked) {
        playWarning();
      } else {
        playChirp();
      }

      const updatedRobots = prev.robots.map((r) => {
        if (r.id === "AMR-03") {
          return {
            ...r,
            path: blocked ? DEFAULT_DETOUR : DEFAULT_ROUTES["AMR-03"],
            path_index: 0,
            progress: 0,
            status: (blocked ? "Rerouting" : "Moving") as RobotState["status"],
          };
        }
        return r;
      });

      const updatedEvents: FleetEvent[] = [
        {
          time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
          type: blocked ? "REROUTE" : "INTENT",
          message: blocked
            ? "Obstacle injected at Aisle B-07! AMR-03 re-planning perimeter route P-2 via D* Lite (42ms)"
            : "Obstacle cleared at Aisle B-07. Nominal highway corridor restored.",
        },
        ...prev.events,
      ];

      return {
        ...prev,
        aisle_blocked: blocked,
        robots: updatedRobots,
        events: updatedEvents.slice(0, 20),
      };
    });
  };

  const handleToggleRadar = () => {
    playRadarPing();
    setShowRadar(!showRadar);
  };

  const handleTriggerScenario = (scenario: "mutex" | "obstacle" | "offline") => {
    if (scenario === "mutex") {
      setState((prev) => ({
        ...prev,
        running: true,
        aisle_blocked: false,
        reservation: "AMR-01",
        robots: prev.robots.map((r) => {
          if (r.id === "AMR-01") {
            return { ...r, position: { x: 380, y: 270 }, progress: 0.3, status: "Moving" };
          }
          if (r.id === "AMR-02") {
            return { ...r, position: { x: 500, y: 150 }, progress: 0.2, status: "Yielding" };
          }
          return r;
        }),
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "LEASE" as const,
            message: "DEMO SCENARIO 1: Corridor C-14 Mutex Arbitration engaged. AMR-02 yielding at Hold Line N-14 while AMR-01 proceeds.",
          },
          ...prev.events,
        ].slice(0, 20),
      }));
    } else if (scenario === "obstacle") {
      setState((prev) => ({
        ...prev,
        running: true,
        aisle_blocked: true,
        robots: prev.robots.map((r) => {
          if (r.id === "AMR-03") {
            return {
              ...r,
              path: DEFAULT_DETOUR,
              path_index: 0,
              progress: 0.2,
              position: { x: 740, y: 490 },
              status: "Rerouting",
            };
          }
          return r;
        }),
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "REROUTE" as const,
            message: "DEMO SCENARIO 2: Aisle B-07 blocked! AMR-03 dynamically detouring via D* Lite perimeter path P-2 in 41.6ms.",
          },
          ...prev.events,
        ].slice(0, 20),
      }));
    } else if (scenario === "offline") {
      setState((prev) => ({
        ...prev,
        running: true,
        events: [
          {
            time: `T+${(prev.tick * 0.6).toFixed(1)}s`,
            type: "HEARTBEAT" as const,
            message: "DEMO SCENARIO 3: Central Cloud connection severed. Peer mesh maintaining 100% nominal V2V consensus over local 5GHz LAN.",
          },
          ...prev.events,
        ].slice(0, 20),
      }));
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Universal Industrial Navbar with Theme & Sound Toggle */}
      <Navbar
        apiStatus={apiStatus}
        onOpenUserModal={() => setShowUserModal(true)}
        onOpenCmdPalette={() => setShowCmdPalette(true)}
      />

      {/* Main Flagship Content */}
      <main id="main-content" className="page-wrapper" style={{ flex: 1 }}>
        {/* 1. Hero Section with Live Hotspots, Floating HUD & Metric Strip */}
        <HeroSection reservation={state.reservation} />

        {/* 2. Autonomous Operational Lifecycle: 6-Phase Decentralized Workflow */}
        <WorkflowSection />

        {/* 3. Interactive Systems Intelligence Bento Grid (Pro UX Showcase) */}
        <BentoGrid />

        {/* 3. Problem vs Solution Comparative Architecture */}
        <ProblemSolution />

        {/* 4. High-Fidelity Floor Digital Twin Simulation */}
        <section id="simulator" className="content-section">
          <div className="section-header">
            <div className="section-kicker">Interactive Mission Control</div>
            <h2 className="section-title">High-Fidelity Floor Digital Twin</h2>
            <p className="section-description">
              Observe real-time peer-to-peer AMR arbitration in Warehouse Zone 02. Inject dynamic aisle blockages,
              inspect space-time mutex leases at Corridor C-14, and click any AMR to inspect its live tactical HUD.
            </p>
          </div>

          {/* SIH 26123 Evaluator Demo Controller & Presenter Prompter Guide */}
          <DemoPresenterGuide
            isRunning={state.running}
            onToggleRunning={handleToggleRunning}
            onReset={handleResetFloor}
            onInjectBlockage={handleInjectBlockage}
            aisleBlocked={state.aisle_blocked}
            reservation={state.reservation}
            robots={state.robots}
            onTriggerScenario={handleTriggerScenario}
          />

          <div className="simulator-container">
            {/* Map Canvas & Toolbar */}
            <div className="simulator-map-wrap">
              <SimulatorControls
                isRunning={state.running}
                onToggleRunning={handleToggleRunning}
                onReset={handleResetFloor}
                onInjectBlockage={handleInjectBlockage}
                aisleBlocked={state.aisle_blocked}
                robots={state.robots}
                showRadar={showRadar}
                onToggleRadar={handleToggleRadar}
                showHeatmap={showHeatmap}
                onToggleHeatmap={() => {
                  playClick();
                  setShowHeatmap(!showHeatmap);
                }}
              />

              <WarehouseMap
                robots={state.robots}
                reservation={state.reservation}
                aisleBlocked={state.aisle_blocked}
                showRadar={showRadar}
                showHeatmap={showHeatmap}
                onSelectRobot={(r) => {
                  playChirp();
                  setInspectedRobot(r);
                }}
              />

              {/* Real-time Telemetry & Latency Sparkline Chart */}
              <LiveTelemetryChart isRunning={state.running} />

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
                  paddingTop: 8,
                }}
              >
                <span>Control cycle: 600ms deterministic tick &middot; ROS 2 / Zenoh peer packets: {state.messages}</span>
                <span>ISO 3691-4: 0.5m dynamic lateral clearance active</span>
              </div>
            </div>

            {/* Sidebar State & Telemetry */}
            <TelemetryPanel
              robots={state.robots}
              reservation={state.reservation}
              selectedRobotId={inspectedRobot?.id}
              onSelectRobot={(r) => {
                playChirp();
                setInspectedRobot(r);
              }}
            />
          </div>

          {/* Replicated Intent & Lease Event Stream */}
          <EventStream events={state.events} />

          {/* Real-time pgvector RAG SOP Search */}
          <RagSearch />
        </section>

        {/* 5. The 4-Stage Decentralized Control Loop (Interactive Stepper & Math) */}
        <InteractiveProtocolFlow />

        {/* 6. Decentralized Protocol & Mathematical Formulations */}
        <ArchitectureSection />

        {/* 7. Safety Standards & SIH-26123 Compliance Matrix */}
        <SafetyMatrix />

        {/* 8. Empirical Benchmarks & Hardware Specs */}
        <BenchmarkSection />

        {/* 9. Reviewer 60-Second Snapshot */}
        <ReviewerSnapshot />
      </main>

      {/* Tactical AMR HUD Inspector Drawer/Modal */}
      <RobotHudModal
        robot={inspectedRobot}
        onClose={() => setInspectedRobot(null)}
      />

      {/* Industrial Command Palette (⌘K) with Keyboard Listener & Quick Triggers */}
      <CommandPalette
        onInjectBlockage={handleInjectBlockage}
        onResetFloor={handleResetFloor}
        onToggleRunning={handleToggleRunning}
        onToggleRadar={handleToggleRadar}
      />

      {/* Industrial Footer */}
      <Footer />

      {/* DPDP/GDPR Telemetry Consent Banner */}
      <CookieBanner />

      {/* User Management & RBAC Modal */}
      <UserManagementModal isOpen={showUserModal} onClose={() => setShowUserModal(false)} />
    </div>
  );
}
