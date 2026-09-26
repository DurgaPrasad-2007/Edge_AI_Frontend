"use client";

import { useState, useEffect, useRef } from "react";
import type { RobotState } from "@/lib/fleet-contract";
import { useFleetSocket } from "@/lib/use-fleet-socket";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CookieBanner } from "@/components/cookie-banner";
import { UserManagementModal } from "@/components/user-management-modal";
import { HeroSection } from "@/components/landing/hero-section";
import { SystemsShowcaseGrid } from "@/components/landing/systems-showcase-grid";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { InteractiveProtocolFlow } from "@/components/landing/interactive-protocol-flow";
import { ArchitectureSection } from "@/components/landing/architecture-section";
import { SafetyMatrix } from "@/components/landing/safety-matrix";
import { BenchmarkSection } from "@/components/landing/benchmark-section";
import { WarehouseMap } from "@/components/digital-twin/warehouse-map";
import { SimulatorControls } from "@/components/digital-twin/simulator-controls";
import { TelemetryPanel } from "@/components/digital-twin/telemetry-panel";
import { EventStream } from "@/components/digital-twin/event-stream";
import { RagSearch } from "@/components/digital-twin/rag-search";
import { LiveTelemetryChart } from "@/components/digital-twin/live-telemetry-chart";
import { MeshConversation } from "@/components/digital-twin/mesh-conversation";
import { RobotHudModal } from "@/components/digital-twin/robot-hud-modal";
import { DemoPresenterGuide, type DemoScenario } from "@/components/digital-twin/demo-presenter-guide";
import { CommandPalette } from "@/components/ui/command-palette";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { playClick, playWarning, playLeaseAcquired, playChirp, playRadarPing } from "@/lib/sound-effects";

const SCENARIO_NAMES: Record<string, string> = {
  mutex: "Head-on Chokepoint Mutex",
  obstacle: "Dynamic Obstacle A* Replan",
  auction: "Contract-Net Task Auction",
  dropout: "Agent Dropout & Lease Expiry",
  battery: "Low Battery & Auto-Charge",
};

export function LandingPage() {
  const {
    fleetState,
    world,
    robots,
    tasks,
    events,
    p2pMessages,
    robotColor,
    isConnected,
    sendControl,
    injectBlockage,
    setBlockage,
    requestReservation,
    publishIntent,
    createTask,
    setRobotBattery,
    simulateAgentDropout,
  } = useFleetSocket();

  // Scenario buttons act on whatever the backend actually has: its first mutex zone, its aisle node and its robots.
  const zoneId = world?.mutex_zones[0] ?? "C-14";
  const aisleId = world?.nodes.find((n) => /aisle/i.test(n.id))?.id ?? world?.nodes.find((n) => n.type === "transit")?.id ?? "B-07";
  const [first, second] = robots;

  const apiStatus = isConnected ? "online" : "offline";
  const [showUserModal, setShowUserModal] = useState(false);
  const [inspectedRobot, setInspectedRobot] = useState<RobotState | null>(null);
  const [showRadar, setShowRadar] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showMeshConversation, setShowMeshConversation] = useState(true);
  const [showCmdPalette, setShowCmdPalette] = useState(false);

  // Keep inspected robot in sync with live real telemetry
  useEffect(() => {
    if (inspectedRobot) {
      const match = robots.find((r) => r.id === inspectedRobot.id);
      if (match) setInspectedRobot(match);
    }
  }, [robots, inspectedRobot]);

  // One command in flight at a time: rapid clicks used to race on stale fleet state and fight each other.
  const busy = useRef(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const exclusive = async (fn: () => Promise<unknown>) => {
    if (busy.current) return;
    busy.current = true;
    try {
      await fn();
    } finally {
      busy.current = false;
    }
  };

  const handleToggleRunning = () => {
    playClick();
    void exclusive(() => sendControl(fleetState?.running ? "pause" : "start"));
  };

  const handleResetFloor = () => {
    playChirp();
    void exclusive(() => sendControl("reset", { clearJobs: true }));
  };

  const handleInjectBlockage = () => {
    if (fleetState?.aisle_blocked) playChirp();
    else playWarning();
    void exclusive(() => injectBlockage(aisleId));
  };

  const handleToggleRadar = () => {
    playRadarPing();
    setShowRadar(!showRadar);
  };

  const handleTriggerScenario = (scenario: DemoScenario) =>
    exclusive(async () => {
      // Every scenario starts from a clean floor (reset clears robots, leases, blockages). Guests cannot delete
      // tasks, so no cleanup round-trips; start is skipped when the fleet is already running.
      setSwitching(scenario);
      const minVisible = new Promise((resolve) => setTimeout(resolve, 700)); // long enough to be noticed, short enough not to nag
      try {
        await sendControl("reset", { clearJobs: true });
        if (!fleetState?.running) await sendControl("start");
      const robotIds = world?.robots.map((r) => r.id) ?? robots.map((r) => r.id);
      const target = robotIds[1] ?? robotIds[0];
      // Every scenario keeps all three robots busy, so what you watch is the group managing the situation.
      const job = (pickup: string, destination: string, priority: number, kg: number, urgency: "low" | "standard" | "critical" = "standard") =>
        createTask({ pickup, destination, priority, payload_kg: kg, payload_size: kg > 400 ? "heavy" : kg > 150 ? "medium" : "small", urgency });
      if (scenario === "mutex") {
        playLeaseAcquired();
        // Two robots meet head-on at the corridor while the third works the north-south lane.
        await Promise.all([job("DOCK-W", "DOCK-E", 95, 250, "critical"), job("DOCK-E", "DOCK-W", 65, 180), job("INT-N1", "INT-S2", 55, 100)]);
      } else if (scenario === "obstacle") {
        playWarning();
        // Everyone is mid-route on the lower highway when the aisle gets blocked; all of them re-plan.
        const jobs = await Promise.all([job("BYPASS-W", "BYPASS-E", 80, 160), job("BYPASS-E", "BYPASS-W", 75, 120), job("RACK B-03", "DOCK-W", 70, 140)]);
        void jobs;
        await new Promise((r) => setTimeout(r, 2500));
        await setBlockage(aisleId, true);
      } else if (scenario === "auction") {
        playChirp();
        // Four jobs at once: every robot bids on every job, and each job goes to whoever fits it best.
        await Promise.all([job("RACK A-02", "DOCK-E", 90, 320, "critical"), job("RACK C-01", "DOCK-W", 70, 500), job("RACK A-04", "RACK B-02", 60, 90), job("RACK B-04", "DOCK-W", 50, 200)]);
      } else if (scenario === "dropout") {
        playWarning();
        // Three robots working; one loses its radio. Peers notice the silence, take its job back and finish it.
        const jobs = await Promise.all([job("RACK A-03", "DOCK-W", 80, 120, "critical"), job("DOCK-E", "DOCK-W", 60, 180), job("RACK A-01", "DOCK-E", 55, 100)]);
        const victim = jobs.find((j) => j?.assigned_robot_id)?.assigned_robot_id ?? target;
        await new Promise((r) => setTimeout(r, 1500));
        if (victim) await simulateAgentDropout(victim);
      } else if (scenario === "battery") {
        playChirp();
        // All three robots have work; one runs low, hands its job back to the mesh, and the others absorb it.
        const jobs = await Promise.all([job("RACK A-01", "DOCK-E", 70, 100), job("RACK A-03", "DOCK-W", 65, 100), job("RACK B-02", "DOCK-E", 60, 100)]);
        const victim = jobs[1]?.assigned_robot_id ?? target;
        await new Promise((r) => setTimeout(r, 800));
        if (victim) await setRobotBattery(victim, 22.0);
      }
      } finally {
        setSwitching(null);
      }
    });

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <a href="#main-content" className="skip-link">
        Skip to fleet console
      </a>
      {/* Universal Industrial Navbar with Theme & Sound Toggle */}
      <Navbar
        apiStatus={apiStatus}
        onOpenUserModal={() => setShowUserModal(true)}
        onOpenCmdPalette={() => setShowCmdPalette(true)}
      />

      {/* Main Flagship Content */}
      <main id="main-content" className="page-wrapper main-wrapper" style={{ flex: 1, width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 24px", boxSizing: "border-box" }}>
        {/* 1. Hero Section with 3D Container Scroll, Live Hotspots & Metric Strip */}
        <HeroSection reservation={fleetState?.reservation ?? null} />

        {/* 2. Architectural Systems Sub-Modules (Dali Agency Shared Hairline Grid) */}
        <SystemsShowcaseGrid />

        {/* 3. Problem vs Solution Comparative Architecture & Evaluator 60-Second Briefing */}
        <ProblemSolution />

        {/* 3. High-Fidelity Floor Digital Twin Simulation */}
        <section id="simulator" className="content-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
          <div className="section-header" style={{ marginBottom: 32 }}>
            <div className="section-kicker">Interactive Mission Control</div>
            <h2 className="section-display-title">
              <span className="text-display-muted">High-Fidelity Floor Twin. </span>
              <span className="text-display-emphasis">Deterministic Peer Telemetry.</span>
            </h2>
            <p className="section-description">
              Observe real-time peer-to-peer AMR arbitration in Warehouse Zone 02. Inject dynamic aisle blockages,
              inspect space-time mutex leases at Corridor C-14, and click any AMR to inspect its live tactical HUD.
            </p>
          </div>

          {/* SIH 26123 Evaluator Demo Controller & Presenter Prompter Guide */}
          <DemoPresenterGuide
            isRunning={Boolean(fleetState?.running)}
            onToggleRunning={handleToggleRunning}
            onReset={handleResetFloor}
            onInjectBlockage={handleInjectBlockage}
            aisleBlocked={Boolean(fleetState?.aisle_blocked)}
            reservation={fleetState?.reservation ?? null}
            robots={robots}
            onTriggerScenario={handleTriggerScenario}
          />

          <FleetStatusBanner />

          <div className="simulator-container">
            {/* Map Canvas & Toolbar */}
            <div className="simulator-map-wrap" style={{ position: "relative" }}>
              {switching && (
                <div role="status" aria-live="polite" style={{ position: "absolute", inset: 0, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "color-mix(in srgb, var(--bg-surface) 72%, transparent)", backdropFilter: "blur(2px)", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>
                  <span className="animate-spin" style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid var(--border-tactical)", borderTopColor: "var(--status-active)" }} />
                  Loading scenario: {SCENARIO_NAMES[switching] ?? switching}…
                </div>
              )}
              <SimulatorControls
                isRunning={Boolean(fleetState?.running)}
                onToggleRunning={handleToggleRunning}
                onReset={handleResetFloor}
                onInjectBlockage={handleInjectBlockage}
                aisleBlocked={Boolean(fleetState?.aisle_blocked)}
                robots={robots}
                showRadar={showRadar}
                onToggleRadar={handleToggleRadar}
                showHeatmap={showHeatmap}
                onToggleHeatmap={() => {
                  playClick();
                  setShowHeatmap(!showHeatmap);
                }}
                showMesh={showMeshConversation}
                onToggleMesh={() => {
                  playClick();
                  setShowMeshConversation(!showMeshConversation);
                }}
                aisleLabel={world?.nodes.find((n) => n.id === aisleId)?.label}
                disabled={!isConnected || switching !== null}
              />

              <WarehouseMap
                world={world}
                robots={robots}
                leases={fleetState?.leases ?? {}}
                blockedNodes={fleetState?.blocked_nodes ?? []}
                p2p={p2pMessages}
                showRadar={showRadar}
                showHeatmap={showHeatmap}
                onSelectRobot={(r) => {
                  playChirp();
                  setInspectedRobot(r);
                }}
              />

              {/* Real-time Telemetry & Latency Sparkline Chart */}
              {showMeshConversation && (
                <MeshConversation
                  messages={p2pMessages}
                  robotColor={robotColor}
                  onClose={() => setShowMeshConversation(false)}
                />
              )}

              <LiveTelemetryChart isRunning={Boolean(fleetState?.running)} messages={fleetState?.messages ?? 0} />

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
                <span>
                  Control cycle: {world ? Math.round(world.config.control_period_s * 1000) : "—"}ms tick &middot; peer packets exchanged: {fleetState?.messages ?? 0}
                </span>
                <span>Collisions: {fleetState?.collision_count ?? 0} &middot; queued tasks: {fleetState?.kpis.queued_tasks ?? 0}</span>
              </div>
            </div>

            {/* Sidebar State & Telemetry */}
            <TelemetryPanel
              robots={robots}
              reservation={fleetState?.reservation ?? null}
              selectedRobotId={inspectedRobot?.id}
              onSelectRobot={(r) => {
                playChirp();
                setInspectedRobot(r);
              }}
            />
          </div>

          {/* Replicated Intent & Lease Event Stream */}
          <EventStream events={events} />

          {/* Real-time pgvector RAG SOP Search */}
          <RagSearch />
        </section>

        {/* 4. The 4-Stage Decentralized Coordination Lifecycle */}
        <InteractiveProtocolFlow />

        {/* 5. Decentralized Protocol & Mathematical Formulations */}
        <ArchitectureSection />

        {/* 7. Empirical Benchmarks & Hardware Specs */}
        <BenchmarkSection />

        {/* 8. Safety Standards Separation Boundary & SIH-26123 Compliance Matrix */}
        <SafetyMatrix />
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
