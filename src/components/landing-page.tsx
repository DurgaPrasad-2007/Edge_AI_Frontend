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
import { RobotHudModal } from "@/components/digital-twin/robot-hud-modal";
import { DemoPresenterGuide, type DemoScenario } from "@/components/digital-twin/demo-presenter-guide";
import { CommandPalette } from "@/components/ui/command-palette";
import { FleetStatusBanner } from "@/components/fleet-status-banner";
import { playClick, playWarning, playLeaseAcquired, playChirp, playRadarPing } from "@/lib/sound-effects";

export function LandingPage() {
  const {
    fleetState,
    world,
    robots,
    tasks,
    events,
    p2pMessages,
    isConnected,
    sendControl,
    injectBlockage,
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
  const [showCmdPalette, setShowCmdPalette] = useState(false);
  const autoStartedRef = useRef(false);

  // Auto-seed a demonstration mission if fleet is completely idle on initial connection
  useEffect(() => {
    if (!isConnected || autoStartedRef.current || !world) return;
    const activeTasks = tasks.filter((t) => t.status !== "Completed");
    if (activeTasks.length === 0) {
      autoStartedRef.current = true;
      void sendControl("start");
      void createTask({
        pickup: "DOCK-W",
        destination: "DOCK-E",
        priority: 85,
        payload_kg: 220,
        payload_size: "medium",
        urgency: "standard",
      });
    }
  }, [isConnected, world, tasks, sendControl, createTask]);

  // Keep inspected robot in sync with live real telemetry
  useEffect(() => {
    if (inspectedRobot) {
      const match = robots.find((r) => r.id === inspectedRobot.id);
      if (match) setInspectedRobot(match);
    }
  }, [robots, inspectedRobot]);

  const handleToggleRunning = () => {
    playClick();
    const willRun = !fleetState?.running;
    void sendControl(willRun ? "start" : "pause");
  };

  const handleResetFloor = () => {
    playChirp();
    void sendControl("reset");
  };

  const handleInjectBlockage = () => {
    if (fleetState?.aisle_blocked) {
      playChirp();
    } else {
      playWarning();
    }
    void injectBlockage(aisleId);
  };

  const handleToggleRadar = () => {
    playRadarPing();
    setShowRadar(!showRadar);
  };

  const handleTriggerScenario = async (scenario: DemoScenario) => {
    await sendControl("start");
    if (scenario === "mutex") {
      playLeaseAcquired();
      // Dispatch two opposing missions converging on Corridor C-14 to physically demonstrate arbitration & yielding
      await createTask({ pickup: "DOCK-W", destination: "DOCK-E", priority: 95, payload_kg: 250, payload_size: "medium", urgency: "critical" });
      await createTask({ pickup: "DOCK-E", destination: "DOCK-W", priority: 65, payload_kg: 180, payload_size: "medium", urgency: "standard" });
    } else if (scenario === "obstacle") {
      playWarning();
      // Block Aisle B-07 and dispatch a transit job that forces A* perimeter detour
      if (!fleetState?.aisle_blocked) {
        await injectBlockage(aisleId);
      }
      await createTask({ pickup: "BYPASS-W", destination: "BYPASS-E", priority: 80, payload_kg: 160, payload_size: "small", urgency: "standard" });
    } else if (scenario === "auction") {
      // Contract-Net demo: dispatch a real task between rack and dock, triggering multi-AMR bidding
      playChirp();
      await createTask({ pickup: "RACK A-02", destination: "DOCK-E", priority: 90, payload_kg: 320, payload_size: "heavy", urgency: "critical" });
    } else if (scenario === "dropout") {
      // Agent Dropout & Lease Expiry demo: simulate radio blackout on an AMR
      playWarning();
      const targetRobot = robots.find((r) => r.status !== "Blocked") ?? robots[1] ?? robots[0];
      if (targetRobot) {
        await simulateAgentDropout(targetRobot.id);
      }
    } else if (scenario === "battery") {
      // Low Battery & Opportunity Charging demo: drop battery to 22% (<30% threshold)
      playChirp();
      const targetRobot = robots.find((r) => r.status !== "Charging" && r.leg !== "to_charge") ?? robots[1] ?? robots[0];
      if (targetRobot) {
        await setRobotBattery(targetRobot.id, 22.0);
      }
    }
  };

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
            <div className="simulator-map-wrap">
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
                aisleLabel={world?.nodes.find((n) => n.id === aisleId)?.label}
                disabled={!isConnected}
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
